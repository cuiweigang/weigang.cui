using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace demo
{
    public static class ExpandObject
    {
        public static string ToJson(this object obj)
        {
            return Newtonsoft.Json.JsonConvert.SerializeObject(obj);
        }
    }
}
