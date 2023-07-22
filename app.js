const express = require('express');
const multer = require('multer');

const Geolocation = require('./classes/Geolocation');
const AuthLogProcessor = require('./classes/AuthLogProcessor');

const app = express();
const port = 3000;

const location = new Geolocation();
const upload = multer({dest: 'uploads/'});
const authLogProcessor = new AuthLogProcessor(location);


app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', {groupedLocations: []});
});

app.post('/upload', upload.single('authLog'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file provided.');
        }

        const locations = await authLogProcessor.processLogFile(req.file.path);

        res.render('index', {groupedLocations: locations});
    } 
    catch (err) 
    {
        res.status(500).send('An error occured during file processing : ' + err);
    }
});

app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});