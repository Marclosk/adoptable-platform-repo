# backend/app/storages.py

from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class PublicMediaStorage(S3Boto3Storage):
    location = ""
    default_acl = "public-read"
    file_overwrite = False

    bucket_name = settings.AWS_STORAGE_BUCKET_NAME  # “public”
    custom_domain = settings.AWS_S3_CUSTOM_DOMAIN  # “localhost:9000/public”
    url_protocol = "http:"

    def __init__(self, **kwargs):
        kwargs["endpoint_url"] = settings.AWS_S3_ENDPOINT_URL  # “http://minio:9000”
        super().__init__(**kwargs)


class PrivateMediaStorage(S3Boto3Storage):
    location = ""
    default_acl = "public-read"
    file_overwrite = False

    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    custom_domain = settings.AWS_S3_CUSTOM_DOMAIN  # “localhost:9000/public”

    def __init__(self, **kwargs):
        kwargs["endpoint_url"] = settings.AWS_S3_ENDPOINT_URL
        super().__init__(**kwargs)


class PublicStaticStorage(S3Boto3Storage):
    bucket_acl = "download"
    default_acl = "download"
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME  # “public”
    auto_create_bucket = True

    custom_domain = False
    url_protocol = "http:"

    def __init__(self, **kwargs):
        kwargs["endpoint_url"] = settings.AWS_S3_ENDPOINT_URL
        super().__init__(**kwargs)
