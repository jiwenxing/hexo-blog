title: 使用编辑距离计算文本相似度
categories: Coding
tags: [Algorithm]
toc: true
date: 2018-06-28 16:40:17
---

在语音交互中有这样一种场景：给出一组候选项，希望找出与用户输入相似度最高的一项。例如给用户推荐商品（例如手机）的同时会提供一组品牌的筛选项，当用户输入了“选华为的”，这时就需要匹配到“华为（HUAWEI）”这个候选项。用户输入的多样性及 ASR(Automatic Speech Recognition) 的准确率增加了这个问题的复杂性，这里使用 [编辑距离 Edit distance](https://en.wikipedia.org/wiki/Edit_distance) 可以很好的解决这个问题。

<!-- more -->

## Minimum Edit Distance

Minimum Edit Distance （最小编辑距离），是用來计算两个字符串的相似程度，被广泛用於拼字校正、或是计算两个 DNA 序列的相似程度。它的定义如下，

给定 2 个字符串 a, b。 编辑距离是将 a 转换为 b 的最少操作次数，操作只允许如下 3 种：

- 插入一个字符，例如：`fj -> fxj`
- 删除一个字符，例如：`fxj -> fj`
- 替换一个字符，例如：`jxj -> fyj`


## Computing Minimum Edit Distance

编辑距离计算是一个典型的递归问题，假设

- 字符串 a, 共 m 位，从 `a[1]` 到 `a[m]`；
- 字符串 b, 共 n 位，从 `b[1]` 到 `b[n]`；
- `d[i][j]` 表示字符串 `a[1]-a[i]` 转换为 `b[1]-b[j]` 的编辑距离；

那么有如下递归规律（`a[i]` 和 `b[j]` 分别是字符串 a 和 b 的最后一位）：

1. 当 `a[i]` 等于 `b[j]` 时，`d[i][j] = d[i-1][j-1]`, 比如 `fxy -> fay` 的编辑距离等于 `fx -> fa` 的编辑距离
2. 当 `a[i]` 不等于 `b[j]` 时，`d[i][j]` 等于如下 3 项的最小值：
  - `d[i-1][j] + 1`（删除 a[i]）， 比如 fxy -> fab 的编辑距离 = fx -> fab 的编辑距离 + 1
  - `d[i][j-1] + 1`（插入 b[j])， 比如 fxy -> fab 的编辑距离 = fxyb -> fab 的编辑距离 + 1 = fxy -> fa 的编辑距离 + 1
  - `d[i-1][j-1] + 1`（将 a[i] 替换为 b[j]）， 比如 fxy -> fab 的编辑距离 = fxb -> fab 的编辑距离 + 1 = fx -> fa 的编辑距离 + 1

递归边界：

1. `a[i][0] = i`, b 字符串为空，表示将 a[1]-a[i] 全部删除，所以编辑距离为 i
2. `a[0][j] = j`, a 字符串为空，表示 a 插入 b[1]-b[j]，所以编辑距离为 j

使用公式表示如下：

![](https://wikimedia.org/api/rest_v1/media/math/render/svg/1deeeaebff36dc4bdc79778bcafe0ec17ce63f83)


## Common Algorithm Implementation

按照上面递归思路实现很简单，代码如下

```java
public static int editDistance(String str1, String str2) {
    Preconditions.checkNotNull(str1);
    Preconditions.checkNotNull(str2);

    int len1 = str1.length();
    int len2 = str2.length();

    if (len1 == 0) {
        return len2;
    }else if (len2 == 0) {
		return len1;
	}else if (str1.charAt(len1-1) == str2.charAt(len2-1)) {
		return editDistance(str1.substring(0, len1-1), str2.substring(0, len2-1));
	}else {
		return 1 + min(editDistance(str1.substring(0, len1), str2.substring(0, len2-1)), 
				       min(editDistance(str1.substring(0, len1-1), str2.substring(0, len2)), 
						   editDistance(str1.substring(0, len1-1), str2.substring(0, len2-1))));
	}
}
```



## Wagner–Fischer algorithm Implementation

我们不难发现上面递归的方法时间复杂度和空间复杂度都是 `O(mn)`，效率很低！而使用一种基于动态规划思想的算法 [Wagner–Fischer algorithm](https://en.wikipedia.org/wiki/Wagner–Fischer_algorithm) 则可以将时间复杂度降低到 `O(mn)`，其中 s 为编辑距离，并且空间复杂度也可以降为 O(s)。

前面的方法是从后往前算的，比如我想知道 `a[i][j]` 我可能需要知道 `a[i-1][j-1]`，而另一种思路是从前往后算，先算出各个子问题，然后根据子问题，计算出原问题，下面就来详细解释一下：

以字符串 a = "fxy", b = "fab" 为例

1. 首先建立一个矩阵，用来存放子问题及原问题的编辑距离，并将递归边界在矩阵中填好，如下：   
![](//
jverson.oss-cn-beijing.aliyuncs.com/201808281955_879.png)

2. 然后计算 i = 1, j = 1 所对应的编辑距离    
比较 a[i] 和 b[j] 是否相等然后根据递归规律算出这个值，比如在这种情况下 a[i] = f 和 b[j] = f, 那么 `d[i][j]` 就等于 `d[i-1][j-1]` 等于 0
然后计算 i = 1, j = 2 直到算出 i = 3, j = 3, 原问题的编辑距离就等于 `d[3][3]`，最终矩阵如下：   
![](//
jverson.oss-cn-beijing.aliyuncs.com/201808282003_296.png)

代码实现如下：

```java
public static int editDistance2(String str1, String str2) {
    Preconditions.checkNotNull(str1);
    Preconditions.checkNotNull(str2);

    int len1 = str1.length();
    int len2 = str2.length();

    // len1+1, len2+1, because finally return dp[len1][len2]
    int[][] dp = new int[len1 + 1][len2 + 1];

    for (int i = 0; i <= len1; i++) {
        dp[i][0] = i;
    }

    for (int j = 0; j <= len2; j++) {
        dp[0][j] = j;
    }

    //iterate though, and check last char
    for (int i = 0; i < len1; i++) {
        char c1 = lhs.charAt(i);
        for (int j = 0; j < len2; j++) {
            char c2 = rhs.charAt(j);
            //if last two chars equal
            if (c1 == c2) {
                //update dp value for +1 length
                dp[i + 1][j + 1] = dp[i][j];
            } else {
            	dp[i + 1][j + 1] = 1 + min(dp[i+1][j], min(dp[i][j+1], dp[i][j])); // 这里不需要递归实现了
            }
        }
    }

    return  dp[len1][len2]; 
}
```

明显时间复杂度已经降下来了，因为从前往后算的时候初始值可以直接得到，因此计算下一个元素的时候就不必在像之前一样递归去求，直接使用初始值进行计算，而从后往前算则只能通过递归实现。

另外在实际应用中编辑距离的绝对值并不好衡量相似程度，而一般是通过编辑距离除以两个字符串的最大长度得到一个归一化的相似度值，即 `1.0 - ((double) dp[len1][len2]) / max(len1, len2)`，依次计算输入与候选项的相似度，取最高值并判断该值是否高于设定的阈值（实际应用中设置的是 0.3），满足条件则会返回匹配项，不满足则认为没有命中候选项。


## Usage

中文转化为拼音后计算编辑距离能够有效解决同音词、相似发音词、发音不标准等特殊情况下的语音识别。但是注意编辑距离明显对长句和短句之间的相似度计算偏差很大，因此该方法主要针对长度相近，从一组候选项中进行最佳匹配的场景。

这是 Github 上一个 [Java 中文转拼音](https://github.com/belerweb/pinyin4j)的开源实现，用起来还不错，可以参考。

添加依赖：

```xml
<dependency>
    <groupId>com.belerweb</groupId>
    <artifactId>pinyin4j</artifactId>
    <version>2.5.0</version>
</dependency>
```

封装 Java 工具类：

```java
public class PinYinUtil {
    private static HanyuPinyinOutputFormat format = new HanyuPinyinOutputFormat();

    static {
        format.setCaseType(HanyuPinyinCaseType.LOWERCASE);
        format.setToneType(HanyuPinyinToneType.WITHOUT_TONE);
    }

    // 转换单个字符
    private static String getCharacterPinYin(char c) {
        String[] pinyin = null;
        try {
            pinyin = PinyinHelper.toHanyuPinyinStringArray(c, format);
        } catch (BadHanyuPinyinOutputFormatCombination e) {
            e.printStackTrace();
        }

        // 如果c不是汉字，toHanyuPinyinStringArray会返回null
        if (pinyin == null)
            return null;

        // 只取一个发音，如果是多音字，仅取第一个发音
        return pinyin[0];
    }
    
    // 转换单个字符,返回所有拼音
    private static List<String> getCharacterPinYins(char c) {
        String[] pinyin = null;
        try {
            pinyin = PinyinHelper.toHanyuPinyinStringArray(c, format);
        } catch (BadHanyuPinyinOutputFormatCombination e) {
            e.printStackTrace();
        }

        // 如果c不是汉字，toHanyuPinyinStringArray会返回null
        if (pinyin == null)
            return null;

        return Arrays.asList(pinyin);
    }

    // 转换一个字符串
    public static String getStringPinYin(String str) {
        StringBuilder sb = new StringBuilder();
        String tempPinyin = null;
        for (int i = 0; i < str.length(); ++i) {
            tempPinyin = getCharacterPinYin(str.charAt(i));
            if (tempPinyin == null) {
                // 如果str.charAt(i)非汉字，则保持原样
                sb.append(str.charAt(i));
            } else {
                sb.append(tempPinyin);
            }
        }
        return sb.toString();
    }

    public static boolean isPinYinSame(String text1, String text2) {
        boolean isSame = false;
        if (StringUtils.isNotBlank(text1) && StringUtils.isNotBlank(text2) && text1.length() == text2.length()) {
            int len = text1.length();
            List<String> pinYinList1 = null;
            List<String> pinYinList2 = null;
            Character char1 = null;
            Character char2 = null;
            boolean isAllSame = true;
            for (int i = 0; i < len; i++) {
                char1 = text1.charAt(i);
                char2 = text2.charAt(i);
                pinYinList1 = getCharacterPinYins(char1);
                pinYinList2 = getCharacterPinYins(char2);
                boolean isMatch = false;
                if (pinYinList1 != null && pinYinList2 != null) {
                    for (String pinyin : pinYinList1) {
                        if (pinYinList2.contains(pinyin)) {
                            isMatch = true;
                            break;
                        }
                    }
                } else if (pinYinList1 == null && pinYinList2 == null && char1.equals(char2)) {
                    isMatch = true;
                }
                if (!isMatch) {
                    isAllSame = false;
                    break;
                }
            }
            if (isAllSame) {
                isSame = true;
            }
        }
        return isSame;
    }
    
}
```


## References

1. [Wikipedia - Edit distance](https://en.wikipedia.org/wiki/Edit_distance)
2. [Wikipedia - Wagner–Fischer algorithm](https://en.wikipedia.org/wiki/Wagner%E2%80%93Fischer_algorithm)
3. [Gitbook - edit-distance](https://www.dreamxu.com/books/dsa/dp/edit-distance.html)
4. [百度AI开放平台 - 拼音相似度比较](//ai.baidu.com/docs#/ASR-Tool-diff/top)