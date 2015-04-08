using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace demo
{
    /// <summary>
    /// 生产者
    /// </summary>
    public class Producer
    {

        private CSRedis.RedisClient client = new CSRedis.RedisClient(DB.RedisConnection);

        public void Run()
        {
            new System.Threading.Thread(() =>
            {
                while (true)
                {
                    // 随机生成1,~10000克牛奶
                    var random = new Random();
                    client.LPush("milk", random.Next(1, 10000));

                    // 1秒钟生产一些牛奶
                    System.Threading.Thread.Sleep(1000);
                }
            }).Start();
        }
    }
}
