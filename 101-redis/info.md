# Redis Overview
Redis is an in-memory data structure store used as a distributed cache, message broker, and database. By default, it runs on port **6379**.

### Accessing Redis via Docker
To interact with Redis inside a running Docker container, use `exec` to open a bash shell and then launch the `redis-cli`:
```bash
docker exec -it <container_id> bash
root@container:/# redis-cli
```

### Basic Commands
- **PING**: Check the connection status. Returns `PONG` if the server is running.
  ```redis
  127.0.0.1:6379> ping
  PONG
  ```

### Key-Value Operations
- **SET**: Stores a value associated with a key.
- **GET**: Retrieves the value associated with a key.
  ```redis
  127.0.0.1:6379> set name aniket
  OK
  127.0.0.1:6379> get name
  "aniket"
  ```

### Namespacing and Keys
Redis keys are binary-safe. A common convention is to use colons (`:`) to create namespaces (e.g., `user:1`).
```redis
127.0.0.1:6379> set user:1 aniket
OK
127.0.0.1:6379> get user:1
"aniket"
```

### Conditional Sets (NX)
The `NX` option tells Redis to **Set if Not eXists**. If the key already exists, the command returns `(nil)` and does nothing.

- **Successful creation**:
  ```redis
  127.0.0.1:6379> set msg:1 "hello" nx
  OK
  ```
- **Syntax Error**: Multi-word strings must be wrapped in quotes.
  ```redis
  127.0.0.1:6379> set msg:1 hello new nx
  (error) ERR syntax error
  ```
- **Failed creation (exists)**:
  ```redis
  127.0.0.1:6379> set msg:1 "hello new" nx
  (nil)
  ```

  127.0.0.1:6379> mget user:1 msg:1
1) "aniket"
2) "hello"
127.0.0.1:6379> set count 0
OK
127.0.0.1:6379> incr count
(integer) 1
127.0.0.1:6379> incrby count 10
(integer) 11
127.0.0.1:6379> lpush messages hey
(integer) 1
127.0.0.1:6379> lpush messages ho
(integer) 2
127.0.0.1:6379> rpush messages hir
(integer) 3
127.0.0.1:6379> lpop messages
"ho"
127.0.0.1:6379> rpop messages
"hir"
127.0.0.1:6379> blpop messages 10
1) "messages"
2) "hey"
127.0.0.1:6379> blpop messages 10
(nil)
(10.02s)
127.0.0.1:6379> lrange messages 0 -1
1) "hey"
2) "hir"
127.0.0.1:6379> get user:*
(nil)
127.0.0.1:6379> sadd ip 1
(integer) 1
127.0.0.1:6379> sadd ip 2
(integer) 1
127.0.0.1:6379> sadd 1
(error) ERR wrong number of arguments for 'sadd' command
127.0.0.1:6379> sadd add 1
(integer) 1
127.0.0.1:6379> sadd ip 3
(integer) 1
127.0.0.1:6379> srem ip 3
(integer) 1
127.0.0.1:6379> SISMEMBER ip 2
(integer) 1
very fast moving data can be dumped in redis stream


** also discussed redis pub/sub**
