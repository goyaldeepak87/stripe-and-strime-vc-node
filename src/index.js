const config = require('./config/config')
const app = require('./app')


app.listen(config.port, ()=>{
    console.log("port", config.port)
})