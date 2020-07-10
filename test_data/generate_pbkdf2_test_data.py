from base64 import b64encode, b64decode
import hashlib
from Cryptodome.Cipher import AES
import os
from Cryptodome.Random import get_random_bytes


src_texts = []
salts = []

for n in range(0, 1024):
    src_text = bytes([i * 13 % 256 for i in range(n, n + 64)])
    src_texts.append(src_text)
    salt = bytes([i * 19 % 256 for i in range(n, n + 16)])
    salts.append(salt)


with open("pbkdf2_test_data.js", "w") as f:
    f.write("export default [\n")

    for ix, src_text in enumerate(src_texts):
        salt = salts[ix]
        result = hashlib.pbkdf2_hmac("sha256", src_text, salt, 10000, 32)
        f.write('  {\n')
        f.write('    "src": [%s],\n' % ", ".join(map(str, list(src_text))))
        f.write('    "salt": [%s],\n' % ", ".join(map(str, list(salt))))
        f.write('    "result": [%s],\n' % ", ".join(map(str, list(result))))
        f.write('  },\n')

    f.write("]\n")
