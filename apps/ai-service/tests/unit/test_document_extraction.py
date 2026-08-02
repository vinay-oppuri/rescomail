import pytest
from app.services.resume.document_extraction import _validate_file_url

def test_validate_file_url_allowed():
    # default allowed hosts are "utfs.io,ufs.sh"
    _validate_file_url("https://utfs.io/f/file-key-123.pdf")
    _validate_file_url("https://ufs.sh/f/file-key-456.pdf")
    _validate_file_url("https://sub.utfs.io/file.pdf")

def test_validate_file_url_disallowed():
    with pytest.raises(ValueError, match="Resume file host is not allowed"):
        _validate_file_url("https://malicious-site.com/file.pdf")
        
    with pytest.raises(ValueError, match="Resume file host is not allowed"):
        _validate_file_url("https://github.com/file.pdf")

def test_validate_file_url_invalid_scheme():
    with pytest.raises(ValueError, match="Resume file URL must use https"):
        _validate_file_url("ftp://utfs.io/file.pdf")
