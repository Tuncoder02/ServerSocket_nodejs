const totp = require('./totp');
const http = require('http');
const socketio = require('socket.io');
const { MongoClient } = require('mongodb'); // Import MongoClient từ thư viện mongodb
const { encrypt, decrypt,encryptWithKey2,decryptWithKey2 } = require('./encryption');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Hello, World!</h1>');
});

const io = socketio(server);

io.on('connection', async (socket) => {
    console.log('Client connected');
    const encrypted = encrypt('Wait connect DB');

    socket.emit('message', encrypted);

    // Kết nối đến cơ sở dữ liệu MongoDB
    const uri = "mongodb+srv://Admin0801:Densaumotnguoi@cluster0.mhgu0bp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const encrypted = encrypt('Connected DB');
        socket.emit('message',encrypted );
        const db = client.db("2FA_APP"); // Thay your_database_name bằng tên database của bạn
        const collection = db.collection("Users"); // Thay your_collection_name bằng tên collection của bạn

        // Xử lý sự kiện nhận tin nhắn từ client và lưu trữ vào MongoDB
        socket.on('message', async (message) => {
            console.log('Received message from client:', message);

            const message1=decrypt(message);
            console.log('Received message from client:', message1);

    // Phân tích tin nhắn thành các thành phần riêng biệt
        const parts = message1.split(' '); // Tách theo dấu cách

            if (parts.length === 3 && parts[0] === 'login') {
                const username = encryptWithKey2(parts[1]);
                const password = encryptWithKey2(parts[2]);
                
                const query = {
                    username: username,
                    password: password
                };

                const user = await collection.findOne(query);

                if (user) {
                    console.log('Login successful for user:', user);
                    
                    const encrypted = encrypt('1'+decryptWithKey2(user.twofaon));
                    socket.emit('message',encrypted );
                } else {
                    console.log('Login failed. Username or password incorrect.');
                    const encrypted = encrypt('0');

                    socket.emit('message', encrypted);
                } 

            } else {
                if (parts.length === 3 && parts[0] === 'signup') {
                    const username = encryptWithKey2(parts[1]);
                    const password = encryptWithKey2(parts[2]);
    
                    const query = {
                        username: username
                    };
    
                    const user = await collection.findOne(query);
    
                    if (user) {
                        console.log('Tai khoan da ton tai:', user);
                        const encrypted = encrypt('0');

                        socket.emit('message', encrypted);
                    } else {
                        const query2 = {
                            username: username,
                            password: password, 
                            twofaon: encryptWithKey2('0'),
                            twofakey: encryptWithKey2('0')
                        };
                        collection.insertOne(query2)
                    
                          console.log('dang ky thanh cong');
                          const encrypted = encrypt('1');

                           socket.emit('message', encrypted);
                     }  }

                     else
                  if (parts.length === 3 && parts[0] === 'bat2fa') { 
                    const username = encryptWithKey2(parts[1]);
                    const password = encryptWithKey2(parts[2]);
    
                    const query = {
                        username: username,
                        password: password
                    };
    
                    const user = await collection.findOne(query);
                    if(user)
                        {
                            const skey=totp.generateSecret();
                            const query = {
                                username: username,
                                password: password, 
                                twofaon: encryptWithKey2('0'),
                                twofakey: encryptWithKey2(skey)
                            };
                            const result = await collection.replaceOne(user, query);
                            const encrypted = encrypt(skey);

                            socket.emit('message', encrypted);

                        }

                  }else
                  if (parts.length === 4 && parts[0] === 'xacminhbat2fa') { 
                    const username = encryptWithKey2(parts[1]);
                    const password = encryptWithKey2(parts[2]);
                    const code=parts[3];
                    const query = {
                        username: username,
                        password: password
                    };
    
                    const user = await collection.findOne(query);
                    if(user)
                        {
                            const kt=totp.verifyTOTP(code,decryptWithKey2(user.twofakey))
                            if(kt==true)
                                {
                                    const query = {
                                        username: username,
                                        password: password, 
                                        twofaon: encryptWithKey2('1'),
                                        twofakey: user.twofakey
    
                                    };
                                    const result = await collection.replaceOne(user, query);
                                    const encrypted = encrypt('1');

                                    socket.emit('message', encrypted);
                                }
                            else
                             {
                                const query = {
                                    username: username,
                                    password: password, 
                                    twofaon: encryptWithKey2('0'),
                                    twofakey: encryptWithKey2('0')

                                };
                                const result = await collection.replaceOne(user, query);
                                const encrypted = encrypt('0');

                                socket.emit('message', encrypted);

                             }    

                        }

                  }else
                  if (parts.length === 4 && parts[0] === 'xacminh2fa') { 
                    const username = encryptWithKey2(parts[1]);
                    const password = encryptWithKey2(parts[2]);
                    const code=parts[3];
                    const query = {
                        username: username,
                        password: password
                    };
    
                    const user = await collection.findOne(query);
                    if(user)
                        {
                            const kt=totp.verifyTOTP(code,decryptWithKey2(user.twofakey))
                            if(kt==true)
                                {   
                                    const encrypted = encrypt('1');

                                    socket.emit('message', encrypted);
                                }
                            else
                             {
                                const encrypted = encrypt('0');

                                socket.emit('message', encrypted);

                             }    

                        }

                  }
                  else
                  if (parts.length === 3 && parts[0] === 'tat2fa') { 
                    const username = encryptWithKey2(parts[1]);
                    const password = encryptWithKey2(parts[2]);
                
                    const query = {
                        username: username,
                        password: password
                    };
    
                    const user = await collection.findOne(query);
                    if(user)
                        {
                            const query = {
                                username: username,
                                password: password, 
                                twofaon: '0',
                                twofakey: '0'

                            };
                            const result = await collection.replaceOne(user, query);
                            const encrypted = encrypt('1');

                            socket.emit('message', encrypted);

                        }

                  }
                  else
                     {
                        const encrypted = encrypt('2');

                        socket.emit('message',encrypted);
                     }
            
           
        }
      
    
    });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Xử lý sự kiện lỗi trên kết nối socket
    socket.on('error', error => {
        console.error('Socket error:', error);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
