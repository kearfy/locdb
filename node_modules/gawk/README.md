# gawk

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Travis CI Build][travis-image]][travis-url]
[![Appveyor CI Build][appveyor-image]][appveyor-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Greenkeeper badge][greenkeeper-image]][greenkeeper-url]
[![Deps][david-image]][david-url]
[![Dev Deps][david-dev-image]][david-dev-url]

Gawk wraps JavaScript objects and arrays using ES2015 proxies making them observable. Once a
JavaScript object (or array) is gawked, you can listen for changes including deeply nested changes.

Only objects and arrays can be gawked. All other types are passed through.

Gawked objects and arrays can be interacted with as if they were regular objects/arrays. Built-in
functions such as `JSON.stringify()` work as expected.

> Note: gawk uses ES2015 proxies and thus requires Node.js 6 or newer.

## Installation

    npm i --save gawk

## Examples

```js
import gawk from 'gawk';

const obj = gawk({
    foo: 'bar'
});

gawk.watch(obj, (obj, src) => {
    console.info('object changed!');
    console.info('new value =', obj);
});

obj.foo = 'baz';

console.info(obj); // { foo: 'baz' }
```

You can also be notified if a deep child is changed:

```js
const obj = gawk({
    foo: {
        bar: ['a', 'b']
    }
});

gawk.watch(obj, (obj, src) => {
    console.info('object changed!');
    console.info('new value =', obj);
});

obj.foo.bar.push('c', 'd');

console.info(obj); // { foo: { bar: ['a', 'b', 'c', 'd'] } }
```

To filter watch notifications, simply pass in the property name or array of
property names used to filter the gawk object.

```js
const obj = gawk({
	foo: {
		bar: 'hello'
	}
});

gawk.watch(obj, [ 'foo', 'bar' ], value => {
	console.info(`bar changed to ${value}`);
});

obj.foo.bar = 'world!';
```

To stop watching, simply call `gawk.unwatch()` with the original listener function.

```js
const obj = gawk({ /* ... */ });

function onChange(obj, src) {
	console.log('changed!');
}

gawk.watch(obj, onChange);

obj.foo = 'bar';

gawk.unwatch(obj, onChange);

obj.foo = 'baz'; // does not fire onChange()
```

To update an object and preserve the listeners, you can use the `gawk.set()` function.

```js
const obj = gawk({
	foo: 'bar'
});

gawk.watch(obj, () => {
	console.log('changed!');
});

gawk.set(obj, { baz: 'wiz' });

console.log(obj); // { baz: 'wiz' }

obj.baz = 'wow';

console.log(obj); // { baz: 'wow' }
```

## API

### `gawk(obj)`

Gawks the specified object.

 * `obj` - (Object) The object to gawk.

If `obj` is not an object, is `null`, or is a built-in object such as `JSON` or `Math`, then the
original value is returned, otherwise it returns the gawked object.

Note that the returned object is a proxy-wrapped version of the original input object. You can
interact with the object as you normally would. Some Array methods are wrapped to suppress multiple
change notifications for a single call or to workaround limitations of the proxied objects.

### `isGawked(obj)`

Determines if an variable is a gawked object.

 * `obj` - (Object) The object to check if gawked.

Returns `true` if the specified object has been gawked, otherwise `false`

### `gawk.set(dest, src)`

### `gawk.set(dest, src, compareFn)`

Replaces the entire definition of a gawked object with another object or array while preserving any
listeners and dispatches change nofications afterwards.

 * `dest` - (Object|Array) The destination object. It will be automatically gawked if not already.
 * `src` - (Object|Array) The source object or array to copy from.
 * `compareFn` - (Function) An optional function to call when comparing elements of an array.

Returns the original `dest` object.

### `gawk.watch(subject, listener)`

### `gawk.watch(subject, filter, listener)`

Starts watching the specified gawked object for changes.

 * `subject` - (Object) The gawked object to watch.
 * `filter` - (Array[String] | String) [optional] A list of one or more nested namespaces to filter.
   When a filter is not specified, then it watches the entire object for changes.
 * `listener` - (Function) The function to call when a change occurs.

Returns the original `subject` value.

The filter is works by matching only a specific namespace pattern. For example, say you have a
gawked object `{ foo: { bar: { baz: 'wiz' } } }` and filtering by `[ 'foo', 'bar' ]`. When you set
`foo.bar.baz = 'pow'`, the listener function will be called with the value `{ baz: 'pow' }`. When
you set `foo.bar.raf = 'muk'`, this change will _not_ be emitted.

### `gawk.unwatch(obj)`

### `gawk.unwatch(obj, fn)`

Stops watching a gawked object.

* `subject` - (Object) The gawked object to watch.
* `listener` - (Function) [optional] The function to call when a change occurs. When a `listener` is
  not specified, all listeners are removed from the gawked object.

Returns the original `subject` value.

### `gawk.merge(obj, ...objs)`

Performs a shallow merge of one or more objects into the specified gawked object.

 * `obj` - (Object) The gawked object to merge values into.
 * `...objs` - (Object) One or more objects to merge in.

Returns the original gawked object `obj`.

Note that subsequent object properties will overwrite existing values. Only a single change event is
emitted after all objects have been merged.

### `gawk.mergeDeep(obj, ...objs)`

Performs a deep merge of one or more objects into the specified gawked object.

* `obj` - (Object) The gawked object to merge values into.
* `...objs` - (Object) One or more objects to merge in.

Returns the original gawked object `obj`.

Just as `gawk.merge()`, subsequent object properties will overwrite existing values. Only a single
change event is emitted after all objects have been merged.

If the destination is an array, the two arrays are concatenated.

## Performance

Each gawked object is wrapped in a `Proxy` and contains a object with the gawked object state:
listeners, parents, previous values, and notification queue. These data structures are
created on an as needed basis. A gawked object with no listeners uses an insignificant amount of
memory. However, if you have an object with many levels of deeply nested objects, it could add up
quickly.

As soon as listeners are added via `gawk.watch()`, it will create the `Map` of listeners. If you add
a filter, then a `WeakMap` of previous values gets created. Each gawked object also tracks its
parents using a `Set`. Again, if filters are not used or the object is not nested (i.e. has no
parent), then there's not a significant amount of memory used.

For runtime performance, the more listeners, the slower the notification system is. This is
especially true if the object being modified is deeply nested. Notifications are propagated through
each parent and each parent's parent and so on.

There aren't any official benchmarks. It's up to you to decide if Gawk is right for your app.
Exercise common sense. Don't gawk objects with several dozens of deeply nested objects. Don't add
thousands of listeners.

## Upgrading to v4

Gawk v4 has dropped all gawk data types. You must always call `gawk()`.

Change all `new GawkObject()` calls to `gawk({})` and `new GawkArray()` to `gawk([])`.

Since Gawk v3 and newer uses ES6 Proxies, you no longer need to call `obj.get()`, `obj.set()`,
`obj.delete()`, etc.

Methods `obj.watch()`, `obj.merge()`, and `obj.mergeDeep()` have moved to `gawk.watch()`,
`gawk.merge()`, and `gawk.mergeDeep()`. The first argument must be a gawk object.

Starting in v3, Gawk no longer hashes values. This means speed. Gawk v3+ is about 19 times faster
than v1 and v2.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/gawk.svg
[npm-url]: https://npmjs.org/package/gawk
[downloads-image]: https://img.shields.io/npm/dm/gawk.svg
[downloads-url]: https://npmjs.org/package/gawk
[travis-image]: https://travis-ci.org/cb1kenobi/gawk.svg?branch=master
[travis-url]: https://travis-ci.org/cb1kenobi/gawk
[coveralls-image]: https://img.shields.io/coveralls/cb1kenobi/gawk/master.svg
[coveralls-url]: https://coveralls.io/r/cb1kenobi/gawk
[appveyor-image]: https://ci.appveyor.com/api/projects/status/1ee7r1drlswy5jk6?svg=true
[appveyor-url]: https://ci.appveyor.com/project/cb1kenobi/gawk
[greenkeeper-image]: https://badges.greenkeeper.io/cb1kenobi/gawk.svg
[greenkeeper-url]: https://greenkeeper.io/
[david-image]: https://img.shields.io/david/cb1kenobi/gawk.svg
[david-url]: https://david-dm.org/cb1kenobi/gawk
[david-dev-image]: https://img.shields.io/david/dev/cb1kenobi/gawk.svg
[david-dev-url]: https://david-dm.org/cb1kenobi/gawk#info=devDependencies
