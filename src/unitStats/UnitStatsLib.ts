export const traverseTree = (o: any, func: any, mapper: any, root: string, parent: string) => {
  const relevantSet = new Set<any>();
  //let parent = parent;
  if (parent === "") parent = root;

  for (const i in o) {
    // check if object is relevant (eg. is weapon_bag?)
    const isRelevant = func.apply(this, [i, o[i]]);

    if (!isRelevant && o[i] !== null && typeof o[i] == "object") {
      // remember current node as parrent (parent folder e.g. rifle)
      parent = i;

      //going one step down in the object tree!!
      const childSet = traverseTree(o[i], func, mapper, root, parent);

      childSet.forEach(relevantSet.add, relevantSet);
      // merge relevant object of child
      for (const s in childSet) relevantSet.add(s);

      // add relevant object to return list
    } else if (isRelevant) {
      if (mapper != "undefined") relevantSet.add(mapper.apply(this, [i, o[i], root, parent]));
      else relevantSet.add(o(i));
    }
  }

  return relevantSet;
};

export const mapSbpsTree = (sbps: any) => {
  return sbps;
};
