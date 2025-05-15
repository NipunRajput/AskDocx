from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt_manager = JWTManager()
limiter = Limiter(key_func=get_remote_address)


cors       = CORS()
