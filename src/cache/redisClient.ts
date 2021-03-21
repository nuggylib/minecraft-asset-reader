import redis from "redis"
import util from "util"


/**
 * The app cache client
 * 
 * This contains helper methods to get/set values in 
 * 
 * @see https://redis.io/commands
 * @see https://www.npmjs.com/package/redis
 * @see https://stackoverflow.com/questions/8986982/how-should-i-store-json-in-redis
 * @see https://stackoverflow.com/questions/59557205/redis-use-sync-await-keywords-on
 * @see https://www.albertgao.xyz/2016/08/11/how-to-declare-a-function-type-variable-in-typescript/
 */
export class CacheClient {

    /**
     * The underlying redis client object
     */
    redisClient: redis.RedisClient

    /**
     * Set a new key and value in the redis store
     * 
     * Promisified redis client get method; enables using async/await for the get method. Use this instead
     * of `redisClient.set`.
     * 
     * Sets the specified key to store the given string value. **If the specified key already has a value,
     * it's overwritten, regardless of its type** (e.g., a hash could be overwritten as a string if you aren't
     * careful)
     * 
     * When setting a JSON value, we need to first pipe the data into a Buffer, then set the value to the
     * base64 encoding for the buffer
     * 
     * @returns String `"OK"` if successful, or a null bulk reply if not (see linked references for more info)
     * @see https://redis.io/commands/set
     * @see https://redis.io/topics/protocol#nil-reply
     */
    setAsync: (key: string, value: string) => Promise<"OK" | null>

    /**
     * Get value for key from redis store
     * 
     * Promisified redis client get method; enables using async/await for the get method. Use this instead
     * of `redisClient.get`.
     * 
     * @returns The value for the given key, or null when the key does not exist
     * @see https://redis.io/commands/get
     */
    getAsync: (key: string) => Promise<string | null>

    /**
     * Delete key value pair from redis store
     * 
     * Promisified redis client delete method; enables using async/await for the get method. Use this instead
     * of `redisClient.del`.
     * 
     * @returns The number of deleted keys
     * @see https://redis.io/commands/del
     */
    delAsync: (keys: string[]) => Promise<number>

    constructor() {
        // see - https://stackoverflow.com/questions/20732332/how-to-store-a-binary-object-in-redis-using-node
        this.redisClient = redis.createClient({
            port: 6379,
            host: `localhost`
        })
        this.setAsync = util.promisify(this.redisClient.set.bind(this.redisClient))
        this.getAsync = util.promisify(this.redisClient.get.bind(this.redisClient))
        this.delAsync = util.promisify(this.redisClient.del.bind(this.redisClient))
    }

    /**
     * Set value for the given key
     * 
     * When setting non-string values, convert the value to a Buffer and use the base64 encoding
     * of the buffer as the value
     * 
     * @param args 
     */
    async setValueForKey(args: {
        key: string
        value: string
    }) {
        return await this.setAsync(args.key, args.value)
    }

    /**
     * 
     * NOTE: Sending null, undefined and Boolean values will result in the value coerced to a string! E.g.,
     * if you send null, the string `"null"` will be set; if you send true, the string `"true"` will be 
     * sent, etc.
     * 
     * @param args          Method arguments - contains `key`, the key of the value to get from the redis store
     * @return              The string value for the given key, or null if it doesn't exist
     * @see https://redis.io/commands/get
     */
    async getValueForKey(args: {
        key: string
    }) {
        return await this.getAsync(args.key)
    }

    async deleteKeyValuePair(args: {
        keys: string[]
    }) {
        return await this.delAsync(args.keys)
    }

}