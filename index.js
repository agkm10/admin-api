const express = require( 'express' ),
      cors = require( 'cors' ),
      bodyParser = require( 'body-parser' ),
      session = require( 'express-session' ),
      passport = require( './passport' ),
      config = require( './config.json' ),
      userRoutes = require( './routes/userRoutes.js' ),
      mainRoutes = require( './routes/mainRoutes.js' ),
      adminRoutes = require( './routes/adminRoutes.js' ),
      inputRoutes = require( './routes/inputRoutes.js' ),
      compRoutes = require( './routes/compRoutes.js' ),
      socketServer = require( './socket-server' ),
      router = express.Router(),
      corsOptions = {
          origin:[ `http://localhost:${ config.port0 }`, `http://localhost:${ config.port1 }` ],
          credentials: true
      },
      app = express(),
          server = require( 'http' ).createServer( app ),
          io = require( 'socket.io' )( server );

socketServer( io );
app.use( cors( corsOptions ) );

app.use( bodyParser.json() );
app.use( session( { secret: config.sessionSecret } ) );
app.use( passport.initialize() );
app.use( passport.session() );
app.use( router);

app.use( '/api', mainRoutes );
app.use( '/api/user', userRoutes );
app.use( '/api/admin', adminRoutes );
app.use( '/api/inputs', inputRoutes );
app.use( '/api/comps', compRoutes );



server.listen( config.port1, () => {
    console.log( 'ADMIN-API listening on port', config.port1 )
})
