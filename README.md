# RESP

Implementation of certain parts of the Redis serialization protocol (RESP) specification.

* Implemented RESP encoding and decoding.
* Implemented a simple redis client command-line utility.

```
$ node cli.js localhost 6379
redis> ping
PONG
redis> lpush list 9
1
redis> lrange list
ERR wrong number of arguments for 'lrange' command
redis> lrange list 0 -1
9
redis> lpush list hello
2
redis> lrange list 0 -1
hello,9
redis> lpush list world
3
redis> lrange list 0 -1
world,hello,9
redis> lset list 2 goodbye
OK
redis> lrange list 0 -1
world,hello,goodbye
redis> 
```