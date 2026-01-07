from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    MONGO_URI: str
    DB_NAME: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"

settings = Settings()

