using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using CSRedis;

namespace demo
{
    /// <summary>
    /// 发布订阅者模式
    /// </summary>
    public class PS
    {
        /// <summary>
        /// 发布
        /// </summary>
        public static void Publish()
        {
            // 延迟3秒发布订阅
            System.Threading.Thread.Sleep(3000);
            var thread = new System.Threading.Thread(() =>
            {
                while (true)
                {
                    using (var redis = new RedisClient(DB.RedisConnection))
                    {
                        redis.Publish("channel", "message" + DateTime.Now.ToString("f"));
                        redis.Publish("channel2", "message" + DateTime.Now.ToString("f"));
                    }

                    System.Threading.Thread.Sleep(1000);
                }


            });
            thread.Start();


        }

        /// <summary>
        /// 订阅者
        /// </summary>
        public static void Subscribe()
        {
            var thread = new System.Threading.Thread(() =>
            {
                using (var redis = new RedisClient(DB.RedisConnection))
                {
                    // 接收到消息的处理事件
                    redis.SubscriptionReceived += redis_SubscriptionReceived;

                    //订阅频道
                    redis.Subscribe("channel", "channel2");
                }
            });

            thread.Start();
        }

        static void redis_SubscriptionReceived(object sender, RedisSubscriptionReceivedEventArgs e)
        {
            Console.WriteLine("频道{0} 消息{1}", e.Message.Channel, e.Message.Body);
        }
    }
}
