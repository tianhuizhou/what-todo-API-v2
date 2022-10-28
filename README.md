# what-todo-API-v2

A containerized version of what-todo-API that build on top of Node.js, it will integrate with WebSocket for Real-time features.
Slowly migrate from GCP to AWS services.

---

## Dev plan

* Real time support: using WebSocket for client-server communication. Using Redis as session database to cache data for performance.

* Containerize the server by using Docker and deploy with AWS EC2 (try microservices architecture).

