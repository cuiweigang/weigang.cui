using CSRedis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace demo
{
    class Program
    {
        static void Main(string[] args)
        {
            // 生产消费模式
            // ProducerConsumer();

            using (var redis = new RedisClient(DB.RedisConnection))
            {
                // string类型
                StringType(redis);

                // 哈希类型
                // HashType(redis);

                // 集合类型
                // SetType(redis);

                // 列表结构
                // ListType(redis);

                // SortedSetType(redis);

                // HyperLoglogType(redis);
            }
            Console.Read();
        }

        private static void ProducerConsumer()
        {
            var producer = new Producer();
            producer.Run();
            new Consumer("Abby").Run();
            new Consumer("Carrie").Run();
            new Consumer("Cassie").Run();
            new Consumer("Daisy").Run();
            new Consumer("Fern").Run();
        }

        private static void ListType(RedisClient redis)
        {
            redis.Del("item");
            // 从右侧添加元素
            redis.RPush("item", 1, 2, 3, 4, 5);
            // 获取所有元素
            var range = redis.LRange("item", 0, -1);

            // 获取前三个元素
            var range2 = redis.LRange("item", 0, 2);

            // 从左侧弹出元素
            var val = redis.LPop("item");
        }

        /// <summary>
        /// 集合类型
        /// </summary>
        /// <param name="redis"></param>
        private static void SetType(RedisClient redis)
        {
            Console.WriteLine("集合操作");
            Console.WriteLine("删除元素 {0}", redis.Del("sadd"));

            Console.WriteLine("添加键值到集合{0}", redis.SAdd("sadd", "1", "2", "3", "4"));

            Console.WriteLine("设置过期时间 {0}", redis.Expire("sadd", 5000));
            Console.WriteLine("此键存活的剩余秒数 {0}", redis.Ttl("sadd"));

            // 获取集合下所有成员
            Console.WriteLine("获取集合下所有成员{0}", redis.SMembers("sadd").ToJson());

            Console.WriteLine(" 移除指定的元素 {0}", redis.SRem("sadd", "1"));

            Console.WriteLine("随机移除元素，并返回移除的元素值 {0} ", redis.SPop("sadd1"));

            redis.SAdd("set1", 1, 2, 3, 4, 5);
            redis.SAdd("set2", 1, 2, 4, 5, 6);
            Console.WriteLine("求两个结合的差集: 集合A:{0}   集合B:{1} 差集:{2}", redis.SMembers("set1").ToJson(), redis.SMembers("set2").ToJson(), redis.SDiff("set1", "set2").ToJson());
            Console.WriteLine("求两个结合的交集: 集合A:{0}   集合B:{1} 交集:{2}", redis.SMembers("set1").ToJson(), redis.SMembers("set2").ToJson(), redis.SInter("set1", "set2").ToJson());
            Console.WriteLine("求两个结合的合集: 集合A:{0}   集合B:{1} 合集:{2}", redis.SMembers("set1").ToJson(), redis.SMembers("set2").ToJson(), redis.SUnion("set1", "set2").ToJson());
            Console.WriteLine("把两个交集的结果存在在另外一个集合中 {0} {1}", redis.SDiffStore("set3", "set1", "set2"), redis.SUnion("set3").ToJson());
            Console.WriteLine("SRandMember:{0}", redis.SRandMember("set1", 2).ToJson());
        }

        /// <summary>
        /// 哈希类型
        /// </summary>
        /// <param name="redis"></param>
        private static void HashType(RedisClient redis)
        {
            //设置哈希表 格式 key subkey value subkey2 value2
            redis.HMSet("url", "baidu", "www.baidu.com", "yintai", "www.yintai.com", "wuse", "www.wuseapp.com");
            redis.HMSet("url", "1", "1", "2", "2", "3", "3", "4", "4", "5", "5", "6", "6");
            redis.HMSet("url", "7", "7", "8", "8", "9", "9", "10", "10", "11", "11", "12", "12");

            // 获取哈希表中数据
            var hmGet = redis.HMGet("url", "baidu");

            // 删除哈希表
            redis.HDel("url", "yintai");

            // 扫描哈希表中的所有键值
            var ssscn = redis.HScan("url", 0, null, 10);


            var hmkeys = redis.HVals("url");
            foreach (var item in hmkeys)
            {
                Console.WriteLine(item);
            }
        }

        /// <summary>
        /// 字符串类型
        /// </summary>
        /// <param name="redis"></param>
        private static void StringType(RedisClient redis)
        {

            Console.WriteLine(" person:{0}", redis.Set("person", new Person { Age = 10, Money = 12, Name = "3" }.ToJson()));
            Console.WriteLine("person:{0}", redis.Get("person"));


            // 添加键值  正确返回OK
            Console.WriteLine("添加键值{0}", redis.Set("key", "name"));

            // 获取key的值
            Console.WriteLine("获取key的值:{0}", redis.Get("key"));

            // 删除按键  0 不存在的键 大于等于1成功
            Console.WriteLine("删除key键 {0}", redis.Del("key", "name"));

            // 判断键值是否存在,true：存在 falue:不存在
            Console.WriteLine("判断键值是否存在{0}", redis.Exists("key"));

            // 设置过期时间 100秒后过期
            redis.Set("key", "name");
            Console.WriteLine("设置键的过期时间{0}", redis.Expire("key", 100));

            // 查找所有符合条件的key的值
            Console.WriteLine("查找匹配 k*的项{0}", redis.Keys("k*").ToJson());

            // 扫描所有的键
            var cursor = 0l;
            while (true)
            {
                var result = redis.Scan(cursor, null, 100);

                Console.WriteLine("扫描键值 cursor:{0}  items:{1}", result.Cursor, result.Items.ToJson());

                if (result.Cursor == 0)
                {
                    break;
                }

                cursor = result.Cursor;
            }
        }

        /// <summary>
        /// 有序集合类型
        /// </summary>
        /// <param name="redis"></param>
        private static void SortedSetType(RedisClient redis)
        {
            redis.Del("sort3");

            Console.WriteLine("有序键值:");
            Console.WriteLine("添加键值{0}", redis.ZAdd("sort", "10", "v1", "9", "v2", "11", "v3"));
            Console.WriteLine("获取分值在指定范围内的集合数:{0}", redis.ZCount("sort", "10", "20"));
            Console.WriteLine("获取指定从小到大索引范围内的集合信息{0}", redis.ZRange("sort", 0, 3, true).ToJson()); //先以分值从小到大排序后再根据下标获取
            Console.WriteLine("获取指定从大到小索引范围内的集合信息{0}", redis.ZRevRange("sort", 0, 3, true).ToJson()); //先以分值从小到大排序后再根据下标获取
            Console.WriteLine("获取指定分值范围内的集合信息{0}", redis.ZRangeByScore("sort", "10", "20", true, 0, 2).ToJson());
            Console.WriteLine("获取成员从小到大的排名:{0}", redis.ZRank("sort", "v2"));
            Console.WriteLine("获取成员从大到小的排名:{0}", redis.ZRevRank("sort", "v2"));
            Console.WriteLine("移除指定的成员,不存在的成员将被忽略:{0}", redis.ZRem("sort", "v1"));
            Console.WriteLine("返回指定成员的分值:{0}", redis.ZScore("sort", "v2"));

            redis.ZAdd("sort01", "10", "jack", "11", "peter", "12", "tom");
            redis.ZAdd("sort02", "10", "jack", "11", "cui", "12", "tom");
            Console.WriteLine("{0}", redis.ZUnionStore("sort3", "sort01", "sort02"));
            Console.WriteLine("{0}", redis.ZRange("sort3", 0, -1, true).ToJson());
            Console.WriteLine("{0}", redis.ZUnionStore("sort4", new double[] { 1, 2 }, RedisAggregate.Sum, "sort01", "sort02")); //这个还是不太理解
            Console.WriteLine("{0}", redis.ZRange("sort4", 0, -1, true).ToJson());
        }

        /// <summary>
        /// HyperLoglogType
        /// </summary>
        /// <param name="redis"></param>
        private static void HyperLoglogType(RedisClient redis)
        {
            // Console.WriteLine(redis.Ttl("hyper"));

            Console.WriteLine("添加键值 {0}", redis.PfAdd("hyper", 1, 2, 3, 4, 5, 1, 2, 3, 4, 5));
            Console.WriteLine("基数{0}", redis.PfCount("hyper"));
            // redis.Expire("hyper", 1000);


        }
    }

    public class Person
    {
        public int Age { get; set; }

        public string Name { get; set; }

        public decimal Money { get; set; }

        public override string ToString()
        {
            return string.Format("name:{0} age:{1} money:{2}", Name, Age, Money);
        }
    }
}
