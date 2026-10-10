import socket
import functools
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class DualStackServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6
    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except Exception:
            pass
        super().server_bind()

if __name__ == '__main__':
    doc_dir = Path('reports/p3a-prototype-B').resolve()
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(doc_dir))
    port = 8769
    print(f"Starting dual-stack local web server at http://localhost:{port}/ and http://127.0.0.1:{port}/")
    print(f"Serving directory: {doc_dir}")
    server = DualStackServer(('', port), handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
