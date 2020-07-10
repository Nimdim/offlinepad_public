from base64 import b64encode, b64decode
import hashlib
from Cryptodome.Cipher import AES
import os
from Cryptodome.Random import get_random_bytes


src_texts = []

for n in range(0, 32):
    src_text = bytes([i * 13 % 256 for i in range(n, n + 16)])
    src_texts.append(src_text)


with open("aes_test_data.js", "w") as f:
    f.write("encrypt_data = [\n")

    for key_base in range(0, 16):
        key = bytes([i for i in range(key_base, key_base + 32)])
        for src_text in src_texts:
            cipher = AES.new(key, AES.MODE_CBC, iv=src_text)
            enc = cipher.encrypt(src_text)
            cipher = AES.new(key, AES.MODE_CBC, iv=src_text)
            dec = cipher.decrypt(enc)
            if src_text != dec:
                raise Exception("aaaa")
            f.write('  {\n')
            f.write('    "src": [%s],\n' % ", ".join(map(str, list(src_text))))
            f.write('    "key": [%s],\n' % ", ".join(map(str, list(key))))
            f.write('    "enc": [%s],\n' % ", ".join(map(str, list(enc))))
            f.write('  },\n')

    f.write("]\n")
