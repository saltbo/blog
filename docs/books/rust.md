# RustHowTo
How to do something during rust developing.

---

## 基础

这里罗列了Rust最基本的东西

### 基础类型

| 符号   | 长度      | 值范围 |
| ----- | --------- | ------ |
| u8    | 8-bit     | 0~255 |
| u16   | 16-bit    | 0~65535 |
| u32   | 32-bit    | 0~4294967295 |
| u64   | 64-bit    | 0~18446744073709551615 |
| u128  | 128-bit   |        |
| usize | arch      | - |
| i8    | 8-bit     | -128~127 |
| i16   | 16-bit    | -32768~32767 |
| i32   | 32-bit    | -2147483648~2147483647 |
| i64   | 64-bit    | -9223372036854775808~9223372036854775807 |
| i128  | arch      | - |
| isize | isize-bit |        |
| f32   | 32-bit    |        |
| f64   | 64-bit    |        |
| bool  | 64-bit    | true~false |
| char  | 32-bit    |        |


### 如何定义变量

```rust
// 基本定义
let num1: u32 = 1;
let num2 = 2;    // i32
let float = 1.1; // f64
let done = true;
let char = 'z';

// 数值运算
let sum = 5 + 10;
let difference = 95.5 - 4.3;
let product = 4 * 30;
let quotient = 56.7 / 32.2;
let remainder = 43 % 5;

// 元组
let tup: (i32, f64, u8) = (500, 6.4, 1);
let (x, y, z) = tup;
let x1 = tup.0;
let y1 = tup.1;
let z1 = tup.2;

// int数组
let arr0: [i32; 5] = [0; 10];  // init a empty int array
let arr2: [i32; 5] = [1, 2, 3, 4, 5]; // init a known int array
let arr1 = [1, 2, 3, 4, 5];  // type automatic derivation, can omit writing
let first = arr1[0];
let second = arr1[1];

// bytes = u8 array
let bytes1: [u8; 5] = [0; 5];
let bytes2 = [0u8; 5];

// 切片 = 数组的一部分
let int_slice = &arr1[1..3];
let bytes_slice = &bytes1[1..3];

```

### 如何定义常量和全局变量

```rust
const N: i32 = 5; 

static NAME: &'static str = "Steve";
```



### 如何输出打印

```rust
println!(123);

let abc = "hello rust.";
println!("{:?}", abc)
```

### 如何进行流程控制

```rust
// if
let number = 3;
if number < 5 {
  println!("condition was true");
} else {
  println!("condition was false");
}

let condition = true;
let number = if condition {
  5
} else {
  6
};

// loop
let mut counter = 0;
let result = loop {
  counter += 1;

  if counter == 10 {
    break counter * 2;
  }
};

println!("The result is {}", result);

// while
let mut number = 3;
while number != 0 {
  println!("{}!", number);

  number = number - 1;
}

println!("LIFTOFF!!!");

// for
let a = [10, 20, 30, 40, 50];

for element in a.iter() {
  println!("the value is: {}", element);
}
for number in (1..4).rev() {
  println!("{}!", number);
}
```

### 如何定义函数

```rust
fn function(p: i32) -> i32 {
  p + 10
}
```

### 如何定义类和方法

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
  	// 方法
    fn area(&self) -> u32 {
        self.width * self.height
    }
  
  	// 关联函数
    fn print123() -> i32 {
      println!(123);
    }
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
    Rectangle::print123();
}
```

### 如何定义类型别名

```rust
type byte = u8
```

### 如何组织代码结构

### 如何控制可见性

---
## 类型转换

### 如何把数字转换成字符串



### 如何把字符串转换成数字



### 如何把字符串转换成Bytes



### 如何把Bytes转换成字符串



### 如何将数字转成Bytes

```rust
let bint = 14562;
println!(bint.to_be_bytes());
```

### 如何将Bytes转成数字

```rust
let bytes: [u8; 5] = [22,33,44,55,66];
println!(u32::from_be_bytes(bytes));
```
---
## 加解密
### 如何进行MD5加密

### 如何进行Hmac加密

### 如何进行AES加解密

### 如何进行RSA加解密



---
## 编码解码
### 如何进行Base64编码

### 如何进行Base64解码

### 如何进行URL编码

### 如何进行URL解码

---
## 实际应用

### 如何启动一个HTTP服务

### 如何发送一个HTTP请求

---
# 参考文献
- [Rust程序设计语言](https://kaisery.github.io/trpl-zh-cn/)
- [Learn Rust in Y Minutes](https://learnxinyminutes.com/docs/rust/)

---
# 贡献者
- [Saltbo](https://github.com/saltbo)





