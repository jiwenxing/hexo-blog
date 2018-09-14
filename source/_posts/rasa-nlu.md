title: 使用 Rasa NLU 构建一个中文 ChatBot
categories: Coding
tags: [AI]
toc: true
date: 2018-09-11 21:01:19
---



[Rasa NLU](https://rasa.com/) 是一个开源的、可本地部署并配套有语料标注工具（[rasa-nlu-trainer](https://rasahq.github.io/rasa-nlu-trainer/)）的自然语言理解框架。其本身是只支持英文和德文，中文因为其特殊性需要加入特定的 tokenizer 作为整个流水线的一部分，[Rasa_NLU_Chi](https://github.com/crownpku/Rasa_NLU_Chi) 作为 Rasa_NLU 的一个 fork 版本，加入了 jieba 作为中文的 tokenizer，实现了中文支持。本篇即简单介绍基于 Rasa_NLU_Chi 构建一个本地部署的特定领域的中文 NLU 系统的过程和注意事项。

<!-- more -->




## Why Rasa NLU

自然语言理解（NLU）系统是 chatbot 的基石，尽管使用正则或者模板匹配的方式也能在很多场景下实现一个简单的问答系统，但却缺乏泛化和学习的能力，而基于机器学习的 NLU 系统则可以举一反三不断学习改进模型从而获得越来越好的性能表现。

目前已有的 NLU 工具，大多是以服务的方式，通过调用远程 http 的 restful API 来对目标语句进行解析。包括 Google 的 API.ai、Microsoft 的 Luis.ai、Facebook 的 Wit.ai 等。这些 NLU 系统一边为用户提供NLU的服务，一边也通过用户自己上传的大量标注和非标注数据不断训练和改进自己的模型。对于数据敏感的用户来说，开源的 NLU 工具如 Rasa.ai 就为我们提供了另一种选择。而且这样的开源工具可以本地部署，针对实际需求训练和调整模型，甚至对一些特定领域的需求效果要比那些通用的在线 NLU 服务还要好。

## Rasa Stack

Rasa Stack 包括 Rasa NLU 和 Rasa Core，前者负责进行语义理解（意图识别和槽值提取），而后者负责会话管理，控制跟踪会话并决定下一步要做什么，两者都使用了机器学习的方法可以从真实的会话数据进行学习；另外他们之间还相互独立，可以单独使用。

下图是一个简单的基于 Rasa 的 workflow 示意：

![](http://ochyazsr6.bkt.clouddn.com/3229ba75c0bfdb8ec3da223a84a64913.jpg)



## Pipeline

rasa nlu 支持不同的 Pipeline，其后端实现可支持 spaCy、MITIE、MITIE + sklearn 以及 tensorflow，其中 spaCy 是官方推荐的，另外值得注意的是从 0.12 版本后，MITIE 就被列入 Deprecated 了。

本例使用的 pipeline 为 MITIE+Jieba+sklearn， rasa nlu 的配置文件为 `config_jieba_mitie_sklearn.yml` 如下：

```yml
language: "zh"

pipeline:
- name: "nlp_mitie"
  model: "data/total_word_feature_extractor_zh.dat"  // 加载 mitie 模型
- name: "tokenizer_jieba"  // 使用 jieba 进行分词
- name: "ner_mitie"  // mitie 的命名实体识别
- name: "ner_synonyms"
- name: "intent_entity_featurizer_regex"
- name: "intent_featurizer_mitie"  // 特征提取
- name: "intent_classifier_sklearn" // sklearn 的意图分类模型
```



## Preparation Work

由于在 pipeline 中使用了 MITIE，所以需要一个训练好的 MITIE 模型。MITIE 模型是非监督训练得到的，类似于 word2vec 中的 word embedding，需要大量的中文语料，由于训练这个模型对内存要求较高，并且耗时很长，这里直接使用了网友分享的中文 wikipedia 和百度百科语料生成的模型文件 `total_word_feature_extractor_chi.dat`，通过下面的百度网盘可以直接下载。

> 链接：https://pan.baidu.com/s/1kNENvlHLYWZIddmtWJ7Pdg 密码：p4vx

实际应用中，如果做某个特定领域的 NLU 并收集了很多该领域的语料，可以自己去训练 MITIE 模型，具体训练方法可以参考[MITIE - Github](https://github.com/mit-nlp/MITIE)。


## 构建 rasa_nlu 语料

得到 MITIE 词向量模型以后便可以借助其训练 Rasa NLU 模型，这里需要使用标注好的数据来训练 rasa_nlu，标注的数据格式如下，Rasa 也很贴心的提供了数据标注平台[rasa-nlu-trainer](https://rasahq.github.io/rasa-nlu-trainer/)供用户标注数据。这里我们使用项目里提供的标注好的数据（demo-rasa_zh.json）直接进行训练。

```json
[
	{
	    "text": "我生病了，不知道去哪里看病",
	    "intent": "medical_department",
	    "entities": []
    },
    {
	    "text": "头上烫烫的，感觉发烧了，该去看哪个诊所哪个科室好呢",
	    "intent": "medical_department",
	    "entities": [
	      {
	        "start": 8,
	        "end": 10,
	        "value": "发烧",
	        "entity": "disease"
	      }
	    ]
    }

]
```

## 训练 rasa_nlu 模型

通过上面的准备工作，我们已经有了词向量模型 MITIE 和标注数据，接下来就可以直接按照下面的流程进行训练


```bash
$ source activate learn // 切换到之前创建的虚拟环境

$ git clone https://github.com/crownpku/Rasa_NLU_Chi.git // clone 源码

$ cd Rasa_NLU_Chi

$ python setup.py install  // 安装依赖

// 训练Rasa NLU的模型
$ python -m rasa_nlu.train -c sample_configs/config_jieba_mitie_sklearn.yml --data data/examples/rasa/demo-rasa_zh.json --path models

```

最后一步执行训练会得到一个模型文件如下所示，这个模型文件也是我们应用中进行意图识别和槽值提取直接使用到的模型，这一步可以离线进行训练，也可以在线实时训练。

![](http://ochyazsr6.bkt.clouddn.com/56e255b860872e17c4398a708c061a79.jpg)



## 测试验证

```bash
// 启动服务
$ python -m rasa_nlu.server -c sample_configs/config_jieba_mitie_sklearn.yml --path models

//测试服务
$ curl -XPOST localhost:5000/parse -d '{"q":"我感觉headache该吃什么药？", "project": "", "model": "model_20180912-202427"}' | python -mjson.tool
```
首先启动 Rasa NLU 服务，使用 curl 调用服务验证一下，可以看到如下结果，意图和实体都可以正确识别，同时还会给出识别的打分排序，便于我们观察和调整模型。

```json
{
    "entities": [
        {
            "confidence": null,
            "end": 11,
            "entity": "disease",
            "extractor": "ner_mitie",
            "start": 3,
            "value": "headache"
        }
    ],
    "intent": {
        "confidence": 0.40319739542291566,
        "name": "medical"
    },
    "intent_ranking": [
        {
            "confidence": 0.40319739542291566,
            "name": "medical"
        },
        {
            "confidence": 0.22340213611408624,
            "name": "restaurant_search"
        },
        {
            "confidence": 0.18051898067667496,
            "name": "affirm"
        },
        {
            "confidence": 0.11803116503887297,
            "name": "goodbye"
        },
        {
            "confidence": 0.07485032274745018,
            "name": "greet"
        }
    ],
    "text": "\u6211\u611f\u89c9headache\u8be5\u5403\u4ec0\u4e48\u836f\uff1f"
}
```

## 注意事项

实践的过程中遇到了一些问题花了一些时间去解决，记录一下避免下次继续踩坑。

### 问题一

异常信息：

> Exception: Not all required packages are installed. To use this pipeline, you need to install the missing dependencies. Please install sklearn

解决方法：

```bash
$pip install -U scikit-learn scipy sklearn-crfsuite
```

参考：https://github.com/RasaHQ/rasa_nlu/issues/660


## 参考

- [rasa.com](http://rasa.com/docs/getting-started/overview/)
- [用 Rasa NLU 构建自己的中文 NLU 系统](http://www.crownpku.com/2017/07/27/%E7%94%A8Rasa_NLU%E6%9E%84%E5%BB%BA%E8%87%AA%E5%B7%B1%E7%9A%84%E4%B8%AD%E6%96%87NLU%E7%B3%BB%E7%BB%9F.html)
- [Rasa_NLU_Chi](https://github.com/crownpku/Rasa_NLU_Chi)