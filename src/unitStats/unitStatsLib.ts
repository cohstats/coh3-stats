export const traverseTree = (
  entity: any,
  checkRelevant: any,
  mapper: any,
  path: string,
  parent: string,
) => {
  const relevantSet = new Set<any>();
  //let parent = parent;
  if (parent === "") parent = path;

  for (const i in entity) {
    //extend path
    const currentPath = path + "\\" + i;

    // check if object is relevant (eg. is weapon_bag?)
    const isRelevant = checkRelevant.apply(this, [i, entity[i]]);

    if (!isRelevant && entity[i] !== null && typeof entity[i] == "object") {
      // remember current node as parrent (parent folder e.g. rifle)
      parent = i;

      //going one step down in the object tree!!
      const childSet = traverseTree(entity[i], checkRelevant, mapper, currentPath, parent);

      childSet.forEach(relevantSet.add, relevantSet);

      // merge relevant object of child
      for (const s in childSet) relevantSet.add(s);

      // add relevant object to return list
    } else if (isRelevant) {
      if (mapper != "undefined")
        relevantSet.add(mapper.apply(this, [i, entity[i], path, parent]));
      else relevantSet.add(entity(i));
    }
  }

  return relevantSet;
};
