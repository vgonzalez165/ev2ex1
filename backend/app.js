import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken'
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import path from 'path';


// Para poder acceder a la variable __filename desde un módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clave para el JWT
const secret = 'This 1s the S3cr3T';

let users = [
    {
        username: 'alumno',
        pass: '1234',
        id: 'b3e172ab-906f-4540-8a30-bcd921e1cbac'
    },
    {
        username: 'victor',
        pass: '1234',
        id: '0241ef5c-8fb2-47a0-9e8c-e4e1caf30638'
    }
];
let groups = [
    {
    group: 'Rayden',
    category: 'Rap',
    concerts: [
        {
            place: 'Palacio de Congresos de León',
            date:1686592800000 ,
            lat: 42.59,
            lon: -5.58,
            tickets: 500,
            free_tickets: 500,
            id: 1,
        },
        {
            place: 'Auditorio de León',
            date:1682015400000  ,
            lat: 42.60,
            lon: -5.57,
            tickets: 300,
            free_tickets: 300,
            id: 2,
        },
        {
            place: 'Plaza Mayor de La Bañeza',
            date:1682015400000  ,
            lat: 42.29,
            lon: -5.90,
            tickets: 300,
            free_tickets: 300,
            id: 3,
        },
    ],
    price: 4000,
    img:'raiden.jpg'
    },
    {
        group: 'Rapsuskley',
        category: 'Rap',
        concerts: [
            {
                place: 'Plaza Mayor de Astorga',
                date:1686592800000 ,
                lat: 42.45,
                lon: -6.09,
                tickets: 1000,
                free_tickets: 1000,
                id: 4,
            },
            {
                place: 'El Toralín',
                date:1682015400000  ,
                lat: 42.55,
                lon: -6.59,
                tickets: 300,
                free_tickets: 300,
                id: 5,
            },
            {
                place: 'Plaza Mayor de Sahagún',
                date:1682015400000  ,
                lat: 42.37,
                lon: -5.02,
                tickets: 300,
                free_tickets: 300,
                id: 6,
            },
        ],
        price: 4000,
        img:'rapsus.jpg'
    },
    {
        group: 'SFDK',
        category: 'Rap',
        concerts: [
            {
                place: 'Plaza Mayor de La Bañeza',
                date:1686592800000 ,
                lat: 42.29,
                lon: -5.90,
                tickets: 1000,
                free_tickets: 1000,
                price: 4000,
                id: 7,
            },
            {
                place: 'La Robla',
                date:1682015400000  ,
                lat: 42.80,
                lon: -5.62,
                tickets: 300,
                free_tickets: 300,
                price: 3500,
                id: 8,
            },
        ],
        price: 4000,
        img:'sfdk.jpg'
    },
    {
        group: 'Nach',
        category: 'Rap',
        concerts: [
            {
                place: 'Plaza Mayor de La Bañeza',
                date:1686592800000 ,
                lat: 42.29,
                lon: -5.90,
                tickets: 1000,
                free_tickets: 1000,
                price: 4000,
                id: 9,
            },
            {
                place: 'La Robla',
                date:1682015400000  ,
                lat: 42.80,
                lon: -5.62,
                tickets: 300,
                free_tickets: 300,
                price: 3500,
                id: 10,
            },
        ],
        price: 4000,
        img:'nach.jpg'
    },
    {
        group: 'Extremoduro',
        category: 'Rock',
        concerts: [
            {
                place: 'Plaza Mayor de La Bañeza',
                date:1686592800000 ,
                lat: 42.29,
                lon: -5.90,
                tickets: 1000,
                free_tickets: 1000,
                price: 4000,
                id: 11,
            },
            {
                place: 'La Robla',
                date:1682015400000  ,
                lat: 42.80,
                lon: -5.62,
                tickets: 300,
                free_tickets: 300,
                price: 3500,
                id: 12,
            },
        ],
        price: 4000,
        img:'extremoduro.jpg'
    },
    
];




// const {name, location, stars, services} = req.body;

// Servidor web Express
let app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors()); 

const PORT = 5000;
app.listen( PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
})

function generateAccessToken(username) {
    return jwt.sign(username, secret, { expiresIn: '86400s' }); // Caducidad de 1 día
  }




// *************************************************************************
// Páginas estáticas
// *************************************************************************

// Raíz. Muestra la página HTML
app.get("/", (req, res, next) => {
    res.sendFile( path.join(__dirname, './index.html') );
});


// *************************************************************************
// Funciones de la API
// *************************************************************************

// POST /api/user
app.post("/api/user", (req, res, next) => {
    // Estructura del JSON
    // {
    //     username: '',
    //     pass: '',
    // }
    // Estructura del JSON de vuelta:
    // {
    //     success: true|false,
    //     msg: '',     // ERROR: Mensaje del error
    //     id: ''       // ÉXITO: identificador asignado al usuario
    // }
    
    let {username, pass} = req.body;

    // ERROR: algún campo está vacío
    if (!( username && pass )) {
        res.status(400)     // Bad request
           .json( {
                success: false,
                msg: "Es obligatorio indicar nombre de usuario y contraseña",
           });
        return;
    }

    // ERROR: el usuario que ya existe
    if ( users.find( item => item.username == username )) {
        res.status(409)     // Conflict
           .json( {
                success: false,
                msg: "El nombre de usuario ya existe",
           })
        return;
    }

    // ÉXITO. Aquí la guardo en memoria
    const id = randomUUID();
    users.push({
        id,
        username,
        pass,   
        active: true
    })
    res.status(200)
       .json( {
            success: true,
            id,
            msg: "Se ha creado el usuario",
        } )
    }
)

// POST /api/login
app.post("/api/login", (req, res) => {
    const {username, pass} = req.body;
    let user = users.find( (item) => item.username?.toLowerCase() == username?.toLowerCase() && item.pass == pass);
    if ( user ) {
        const token = generateAccessToken({ username: req.body.username });
        res.status(200).json({
            success: true,
            username,
            id: user.id,
            token
        });
    } else {
        res
            .status(401)
            .json({
                success: 'false',
                msg: 'Credenciales no válidas o error en la consulta'
            })
    }
})

// GET /api/user
// Únicamente para pruebas
app.get('/api/user', (req, res) => {
    res.status(200).json(users);
})



function isValidToken(token, username) {
    try {
        const json = jwt.verify(token, secret);
        return (json.username == username);
    } catch (e) {
        return false;
    }
}


// GET /api/group
// Filtro por nombre de grupo y por categoría
app.get('/api/group', (req, res) => {

    let {username, name:groupName, category} = req.query;
    let token = req.headers.authorization;

    console.log(users);
    if ( !users.find( item => item.username == username) || !token ) {
        res.status(400)
           .json({msg: 'Error con el nombre de usuario o con el JWT'});
    } else if (!token) {
        res.status(400)
           .json({msg: 'Error al validar las credenciales'})
    } else if(!isValidToken(token, username)) {
        res.status(400)
           .json({msg: 'Error de comprobación del JWT'})
    } else {
        let filteredGroups = groups;
        if (groupName) {
            filteredGroups = filteredGroups.filter (item => item.group.toLowerCase().includes(groupName.toLowerCase()));
        };
        if (category) {
            filteredGroups = filteredGroups.filter (item => item.category.toLowerCase().includes(category.toLowerCase()))
        };
        res.status(200).json(filteredGroups.map( ({group, price, category, concerts, img}) => {
            return {
                group,
                price,
                category,
                concerts,
                img
            }
        }));
    }

})





