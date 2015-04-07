using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace demo
{
    public class Consumer
    {
        private string name = string.Empty;
        public Consumer(string name)
        {
            this.name = name;
        }

        private CSRedis.RedisClient client = new CSRedis.RedisClient("192.92.242.54");

        public void Run()
        {
            new System.Threading.Thread(() =>
            {
                while (true)
                {
                    var milk = client.BRPop(1000, "milk");
                    if (string.IsNullOrEmpty(milk))
                    {
                        Console.WriteLine("{0}抱怨的说,牛奶还没有生产出来", name);
                    }

                    Console.WriteLine("{0}喝到{1}克牛奶", name, milk);
                }
            }).Start();
        }
    }
}
