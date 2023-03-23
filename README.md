### Description

Hooks into the `Enter Item World` and `Reforge` buttons to track the IW progress of an item.
Works with both vanilla HV and HV Utils.

### Setup

1. `npm install`

### Building

1. `tsc --build --watch tsconfig.json`
2. `node ./tools/build-userscript.js`

For dev builds, it might be easier to [enable file access](https://www.tampermonkey.net/faq.php?locale=en#Q204) and insert a `// @require      file:///path/to/dist/userscript.js` header in the installed userscript.

### Samples

<blockquote>
<details>
<summary>localStorage.getItem('hvut_iw_log')</summary>

```js
{
  "283751495": [
    {
      "type": "init",
      "info": {
        "name": "Legendary Charged Cotton Pants of the Heaven-sent",
        "eid": "283751495",
        "key": "223b9d5bf8",
        "date": "2023-03-22T21:06:02.002Z"
      }
    },
    {
      "type": "reforge",
      "potencies": {
        "fireproof": 1,
        "elecproof": 1
      },
      "date": "2023-03-22T21:06:02.002Z"
    },
    {
      "type": "run",
      "potencies": {},
      "date": "2023-03-22T21:06:43.494Z"
    },
    {
      "type": "run",
      "potencies": {
        "juggernaut": 1,
        "capacitor": 1
      },
      "date": "2023-03-22T21:11:55.135Z"
    },
    {
      "type": "reforge",
      "potencies": {
        "juggernaut": 2,
        "capacitor": 1,
        "windproof": 1
      },
      "date": "2023-03-22T21:17:03.843Z"
    },
    {
      "type": "run",
      "potencies": {},
      "date": "2023-03-22T21:17:47.292Z"
    },
    {
      "type": "reforge",
      "potencies": {
        "darkproof": 2
      },
      "date": "2023-03-22T21:33:30.235Z"
    },
    {
      "type": "run",
      "potencies": {},
      "date": "2023-03-22T21:34:11.640Z"
    },
    {
      "type": "reforge",
      "potencies": {
        "elecproof": 2
      },
      "date": "2023-03-22T21:57:48.491Z"
    }
  ]
}
```

</details>
</blockquote>
