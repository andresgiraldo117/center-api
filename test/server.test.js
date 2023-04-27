const mongoose = require("mongoose");
// const createServer = require("../index")
const request = require('supertest');
const { MONGO_DBA, MONGO_DBA2, DB_USER, DB_PASSWORD, DB_PRUEBA } = require('../src/config');
const app = require('../src/app');

describe('Ejemplo de pruebas', () => {

    beforeAll(async () => {
        await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.krmfn.mongodb.net/${MONGO_DBA}?retryWrites=true&w=majority`);

		const response = await request(app).post('/api/auth/login').set('apikey','YzRIbkpZUDJJdTgyWHg2cm5zVzluazRhUjhacVkzT2xP').send({email: "jeanzum@gmail.com",
		password: "avon1234"})
		// console.log('response :>> ', response);
		console.log('response.body.token :>> ', response._body.response.token);
		token = response._body.response.token;
    }, 100000);

    afterAll(async () => {
        await mongoose.disconnect();
    });

	// describe('Simple post test using auth', () => {
	// 	test.only('should respond with a 200 status code', async () => {
	// 	  const response = await request(app)
	// 		.get('/api/users/u')
	// 		// .set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNmFiOWRmZWY3NzM2ODQ1M2YwMmYyNyIsImlhdCI6MTY2ODYzMTg4OSwiZXhwIjoxNjY4NzE4Mjg5fQ.JLETjtxooU6yHXr2_p-fKaJMBKdT1ZynkoN5-7HKlnE`);
	// 	  expect(response.statusCode).toBe(200);
	// 	});
	// });

	describe('GET /api/users', () => {
		test.only('should respond with a 200 status code', async () => {
			// console.log('token desde la peticion :>> ', token);
		  const response = await request(app)
			.get('/api/users')
			// .set('apikey','YzRIbkpZUDJJdTgyWHg2cm5zVzluazRhUjhacVkzT2xP')
			.set('Authorization', `Bearer ${token}`);
			// console.log('response :>> ', response);
		  expect(response.statusCode).toBe(200);
		});
	});
	/* Connecting to the database before each test. */
	// beforeEach(async () => {
	// 	mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.krmfn.mongodb.net/${MONGO_DBA}?retryWrites=true&w=majority`);
  	// });
  
  	// /* Closing database connection after each test. */
  	// afterEach(async () => {
	// 	await mongoose.connection.close();
  	// });

	describe('GET /api/users ', () => {
		it('should responds with 200 and fiist test', () => {
			request(app)
				.get('/api/users')
				.set('apikey','YzRIbkpZUDJJdTgyWHg2cm5zVzluazRhUjhacVkzT2xP') 
		  		.set('Authorization','token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNmFiOWRmZWY3NzM2ODQ1M2YwMmYyNyIsImlhdCI6MTY2ODExOTY1MCwiZXhwIjoxNjY4MjA2MDUwfQ.YTUwBzKkNUItpiALlqyvYpcRAKRuWt5fLBSsQhzJd3Q') 
				// .expect('Content-Type', /json/)
				.expect(500)
				.end((error, response) => {
				if (error) {
					return error;
				}
				return response;
			});
		});
	});

	describe('GET /api/users ', () => {
		test('<should responds with 200 try cacth test', async() => {
			try {
				const info = [];
				const res = await request(app).get('/api/users')
				expect(res.statusCode).toBe(200)
				expect(res.status).toBe(200)
			} catch (error) {
				console.log('error :>> ', error);
			}
		});
	});


	describe('App Request', () => {
		it('should responds with 200 a second test', async (done) => {
		//   const result = await request(app).get('/api/users')
		//   .set('apikey','YzRIbkpZUDJJdTgyWHg2cm5zVzluazRhUjhacVkzT2xP') 
		//   .set('Authorization','token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNmFiOWRmZWY3NzM2ODQ1M2YwMmYyNyIsImlhdCI6MTY2ODExOTY1MCwiZXhwIjoxNjY4MjA2MDUwfQ.YTUwBzKkNUItpiALlqyvYpcRAKRuWt5fLBSsQhzJd3Q') 
		//   expect(200);
		//   done();

		  request(app)
				.get('/api/users')
				.set('apikey','YzRIbkpZUDJJdTgyWHg2cm5zVzluazRhUjhacVkzT2xP') 
		  		.set('Authorization','token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNmFiOWRmZWY3NzM2ODQ1M2YwMmYyNyIsImlhdCI6MTY2ODExOTY1MCwiZXhwIjoxNjY4MjA2MDUwfQ.YTUwBzKkNUItpiALlqyvYpcRAKRuWt5fLBSsQhzJd3Q') 
				// .expect('Content-Type', /json/)
				.expect(200)
				.end((error, response) => {
				if (error) {
					return error;
				}
				return response;
			});
		});
	  });

	// describe('App Request promise enviando headers', () => {
	// 	request(app)
    //   		.get('/api/users')
	// 		.set({ 'ApiKey': 'YzRIbkpZUDJJdTgyWHg2cm5zVzluazRhUjhacVkzT2xP', Accept: 'application/json', Authorization: "Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNmFiOWRmZWY3NzM2ODQ1M2YwMmYyNyIsImlhdCI6MTY2ODExOTY1MCwiZXhwIjoxNjY4MjA2MDUwfQ.YTUwBzKkNUItpiALlqyvYpcRAKRuWt5fLBSsQhzJd3Q" })
    //   		.send()
    //   		// .setHeader('Authorization', token)
    //   		.end((err, res) => {
    //     	const newCategory = res.body;

    //     	expect(res.status).toBe.equal(200);

    //     done();
    //   });
	//   });

    // beforeAll(async () => {
    //     await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.krmfn.mongodb.net/${MONGO_DBA}?retryWrites=true&w=majority`)
    // });

    // afterAll(async () => {
    //     await mongoose.disconnect();
    // });

    // describe('GET /api/accounts', () => {
    //     let response;

    //     beforeEach(async () => {
    //         response = await request(app).get('/api/accounts/').send();
    //     });

    //     test('La ruta funciona', () => {
    //         expect(response.statusCode).toBe(401)
    //     });
		
	// 	it('La ruta debe responder mal', async() => {
	// 		await expect(response.status).toBe(200)
	// 	});
    // });

	// describe("GET /api/users/", () => {
	// 	it("should return all products", async () => {
	// 	  const res = await request(app).get("/api/users/");
	// 	  expect(res.statusCode).toBe(200);
	// 	  expect(res.body.length).toBeGreaterThan(0);
	// 	});
	//   });

	// describe("GET /api/users/", () => {
	// 	it("probando la ruta de la ruta all products", async () => {
	// 	  const res = await request(rutaUsers).get("/");
	// 	  expect(res.statusCode).toBe(200);
	// 	  expect(res.body.length).toBeGreaterThan(0);
	// 	});
	//   });

})


	// describe("Test the root path", () => {
	// 	test("It should response the GET method", async() => {
	// 		let response = await request(app).get('/api/prueba').send()

	// 		it('La ruta funciona', async() => {
	//             await expect(response.status).toBe(200)
	//         });
	// 		  	// expect(response.statusCode).toBe(200);
	// 	});
	// });



// describes('test test prueba', () => {
// 	test("GET /api/prueba/", async () => {

// 		// const post = await Post.create({
// 		// 	title: "Post 1",
// 		// 	content: "Lorem ipsum",
// 		// })
	
// 		await supertest(app)
// 			.get("/api/accounts/")
// 			.expect(200)
// 			.then((response) => {
// 				expect(response.body._id).toBe(post.id)
// 				expect(response.body.title).toBe(post.title)
// 				expect(response.body.content).toBe(post.content)
// 			})
// 	})
// })
// beforeEach((done) => {
// 	mongoose.connect(
// 		"mongodb://localhost:27017/smdcloud",
// 		{ useNewUrlParser: true },
// 		() => done()
// 	)
// })

// afterEach((done) => {
// 	mongoose.connection.db.dropDatabase(() => {
// 		mongoose.connection.close(() => done())
// 	})
// })

//const app = createServer()



/* 
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
 */


	// beforeAll(async (done) => {
  	// 	await mongoose.connect('mongodb://localhost:27017/testdb');
  	// 	server = app.listen(4000, () => {
  	// 	  	global.agent = request.agent(server);
  	// 	  	done();
  	// 	});
	// });

	// afterAll(async () => {
	//   await server.close();
	//   await mongoose.disconnect();
	// });