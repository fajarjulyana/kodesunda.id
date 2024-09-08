const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const Post = require('./models/Post');
const User = require('./models/User');
const sequelize = require('./config/database');
const app = express();

// Middleware untuk parsing body request
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Konfigurasi sesi
app.use(session({
    secret: 'fajarjulyana',
    resave: false,
    saveUninitialized: false,
}));

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/upload'); // Direktori penyimpanan
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Penamaan file dengan timestamp
    }
});
const upload = multer({ storage: storage });

// Middleware untuk melindungi rute admin
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

// Rute untuk homepage
app.get('/', (req, res) => {
    res.redirect('/posts');
});

// Rute untuk menampilkan semua post
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
        res.render('posts', { posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching posts');
    }
});

// Rute untuk menampilkan detail post
app.get('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByPk(postId);
        if (post) {
            res.render('postDetail', { post });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching post');
    }
});

// Rute untuk halaman tentang (About)
app.get('/about', (req, res) => {
    res.render('about');
});

// Rute untuk admin menampilkan form create post
app.get('/admin/posts/create', requireLogin, (req, res) => {
    res.render('admin/admin-create-post');
});

// Rute untuk admin menambah post baru
app.post('/posts/create', requireLogin, upload.single('thumbnail'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const thumbnail = req.file ? req.file.path.replace('public', '') : null; // Simpan path thumbnail
        await Post.create({ title, content, thumbnail });
        res.redirect('/admin/posts');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating post');
    }
});

// Rute untuk admin menghapus post
app.post('/posts/delete/:id', requireLogin, async (req, res) => {
    try {
        const postId = req.params.id;
        await Post.destroy({ where: { id: postId } });
        res.redirect('/admin/posts');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting post');
    }
});

// Rute untuk admin mengedit post
app.get('/posts/edit/:id', requireLogin, async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findByPk(postId);
        if (post) {
            res.render('edit-post', { post });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching post for edit');
    }
});

// Rute untuk admin memperbarui post
app.post('/posts/edit/:id', requireLogin, upload.single('thumbnail'), async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content } = req.body;
        const thumbnail = req.file ? req.file.path.replace('public', '') : null;
        await Post.update(
            { title, content, thumbnail },
            { where: { id: postId } }
        );
        res.redirect('/admin/posts');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating post');
    }
});

// Rute untuk admin menampilkan semua post
app.get('/admin/posts', requireLogin, async (req, res) => {
    try {
        const posts = await Post.findAll({ order: [['createdAt', 'DESC']] });
        res.render('admin/admin-posts', { posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching posts for admin');
    }
});
// Rute untuk menampilkan semua pengguna (admin saja)
app.get('/admin/users', requireLogin, async (req, res) => {
    const users = await User.findAll();
    res.render('admin/admin-users', { users });
});

// Rute untuk menghapus pengguna (admin saja)
app.post('/admin/users/delete/:id', requireLogin, async (req, res) => {
    const userId = req.params.id;
    await User.destroy({ where: { id: userId } });
    res.redirect('/admin/users');
});


// Rute untuk registrasi admin
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering user');
    }
});

// Rute untuk login admin
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            res.redirect('/admin/posts');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

// Rute untuk logout admin
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Inisialisasi database dan server
sequelize.sync().then(() => console.log("Database Connected"));

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
