from os import curdir
from os.path import join as pjoin
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer


class StoreHandler(BaseHTTPRequestHandler):
    store_path = pjoin(curdir, './export/data/')

    def do_GET(self):
		print(self.store_path + self.path);
		with open(self.store_path + self.path) as fh:
			self.send_response(200)
			self.send_header('Content-type', 'text/json')
			self.end_headers()
			self.wfile.write(fh.read().encode())

    def do_POST(self):
		print (self.store_path + self.path);
		length = self.headers['content-length']
		data = self.rfile.read(int(length))

		with open(self.store_path + self.path, 'w') as fh:
			fh.write(data.decode())

		self.send_response(200)


server = HTTPServer(('', 81), StoreHandler)
server.serve_forever()
