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
            #region[生产消费模式]
            /*
            var producer = new Producer();
            producer.Run();
            new Consumer("Abby").Run();
            new Consumer("Carrie").Run();
            new Consumer("Cassie").Run();
            new Consumer("Daisy").Run();
            new Consumer("Fern").Run();
            return;
            */
            #endregion

            using (var redis = new RedisClient("192.92.242.54"))
            {
                // 添加键值  正确返回OK
                var set = redis.Set("key", "name");

                // 获取key的值
                var value = redis.Get("key");

                // 删除按键  0 不存在的键 大于等于1成功
                var del = redis.Del("key", "name");

                // 判断键值是否存在,true：存在 falue:不存在
                var exist = redis.Exists("key");

                // 设置过期时间 100秒后过期
                redis.Set("key", "name");
                redis.Expire("key", 100);

                // 查找所有符合条件的key的值
                redis.Keys("k*");

                #region[键扫描]
                /**
                var cursor = 0l;
                int i = 0;
                while (true)
                {
                    var result = redis.Scan(cursor, null, 100);

                    foreach (var item in result.Items)
                    {
                        Console.WriteLine("{0}:{1}", i, item);
                        i++;
                    }

                    if (result.Cursor == 0)
                    {
                        break;
                    }

                    cursor = result.Cursor;
                }
                **/
                #endregion

                #region[哈希表]
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

                #endregion

                #region[集合]
                // 集合
                redis.SAdd("sadd", "1", "2", "3", "4");
                // 获取集合下所有成员
                var get = redis.SMembers("sadd");
                // 移除指定的元素
                redis.SRem("sadd", "1");

                // 随机移除一个元素，并返回移除的元素值
                var spop = redis.SPop("sadd");

                #endregion

                #region[列表]

                redis.Del("item");
                // 从右侧添加元素
                redis.RPush("item", 1, 2, 3, 4, 5);
                // 获取所有元素
                var range = redis.LRange("item", 0, -1);

                // 获取前三个元素
                var range2 = redis.LRange("item", 0, 2);

                // 从左侧弹出元素
                var val = redis.LPop("item");

                #endregion

            }
            Console.Read();
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
