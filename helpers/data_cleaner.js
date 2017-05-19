
const keysToLowerCase = (array) => {
	return array.map(obj => {
    Object.keys(obj).forEach(key => {
      const k = key.toLowerCase();
      if (k !== key) {
        obj[k] = obj[key];
        delete obj[key];
      }
    });
    return obj;
  })
}

const reduceByRange = (array) => {
  return array.reduce((obj, mountain) => {
    const key = mountain.range
    !obj[key] && (obj[key] = [])
    obj[key].push(mountain)
    return obj
  },{})
}

const cleanArray = (data) => {
  const lowerCaseMountains = keysToLowerCase(data.mountains)
  const reducedArray = reduceByRange(lowerCaseMountains)
  return reducedArray;
}

module.exports = cleanArray;
