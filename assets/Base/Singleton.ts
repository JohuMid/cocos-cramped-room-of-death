export default class Singleton {
  // 使用 WeakMap 存储不同子类的实例
  private static _instances = new WeakMap<Function, Singleton>();

  protected constructor() {}

  // 泛型方法，T 为子类类型
  public static getInstance<T extends Singleton>(this: new () => T): T {
      if (!Singleton._instances.has(this)) {
          // 创建子类的实例
          const instance = new this();
          Singleton._instances.set(this, instance);
      }
      // 从 WeakMap 中获取子类实例
      return Singleton._instances.get(this) as T;
  }
}
