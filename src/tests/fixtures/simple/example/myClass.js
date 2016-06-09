import MyABCClass from './myABCClass';

/**
 * This is an example of a class.
 * @extends MyABCClass
 * @example Some fake example.
 */
export default class MyClass extends MyABCClass {

  /**
   * @param {Object} param1 - An example parameter.
   */
  constructor(param1) {
    if (!param1) {
      throw new Error('param1 is required');
    }
  }

  /**
   * A test function.
   * @see MyClass.myStaticFunc
   * @param {string} [paramX] - Parameter x.
   * has a lengthy | lengthy
   * description ok.
   * @param {View} [paramY] - Parameter y.
   * @return {Object} The result.
   */
  testFunc(paramX, paramY) {
    return {
      px: paramX,
      py: paramY
    };
  }

  /**
   * A static function.
   * @return {String} An empty string.
   * Here is a long description.
   * Very long.
   *
   * Multiple lines.
   */
  static myStaticFunc() {
    return '';
  }

  /**
   * An example property just like {@link MyClass#testFunc}
   * @type {number|string}
   * @see {@link http://github.com|GitHub}
   * @see MyClass.testFunc
   */
  get exampleProperty() {
    return this.p;
  }

  set exampleProperty(value) {
    this.p = value;
  }

  /**
   * Another function.
   * @return {void}
   */
  anotherFunc() {
  }
}
