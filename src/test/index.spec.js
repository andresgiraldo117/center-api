const request = require('supertest');
const mongoose = require('mongoose');
const { MONGO_DBA, MONGO_DBA2, DB_USER, DB_PASSWORD, DB_PRUEBA } = require('../config');
const app = require('../app');

describe('Ejemplo de pruebas', () => {
    
    beforeAll(async () => {
        await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.krmfn.mongodb.net/${MONGO_DBA}?retryWrites=true&w=majority`)
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('GET /api/prueba', () => {
        let response;

        beforeEach(async () => {
            response = await request(app).get('/api/prueba').send()
        });

        it('La ruta funciona', async() => {
            expect(response.status).toBe(200)
        })
    })

})