"use strict";
const Task = require("../models/taskModel");
const Tag = require("../models/tagModel");

module.exports = (req, res, next) => {
  //! Filtering
  // URL?filter[key1]=value1&filter[key2]=value2
  const filter = req.query?.filter || {};

  //* Searching => gelen ifade içerisinde geçiyor mu geçmiyor mu
  // URL?search[key1]=value1&search[key2]=value2
  const search = req.query?.search || {};
  for (let key in search) {
    search[key] = { $regex: search[key] };
  }

  //? Sorting
  // URL?sort[key1]=asc&sort[key2]=desc
  const sort = req.query?.sort || {};

  //* Pagination
  // url?page=3&limit=10
  //! Limit
  let limit = Number(req.query?.limit); // limit() metodu number bekler diyelim
  limit = limit > 0 ? limit : 20;
  //? Page
  let page = Number(req.query?.page);
  page = page > 0 ? page - 1 : 0;

  //! Skip => atlanacak veri sayısı
  let skip = Number(req.query?.skip);
  skip = skip > 0 ? skip : page * limit;

  res.getModelList = async function (
    Model,
    customFilter = {},
    populate = null
  ) {
    return await Model.find({ ...filter, ...customFilter, ...search })
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate(populate);
  };
  res.getModelListDetails = async (Model, customFilter = {}) => {
    let populate = null;

    // Conditionally set populate
    if (Model === Task) {
      populate = [
        { path: "tagId" }, // Populate 'tagId' for tasks
      ];
    }

    const data = await Model.find({
      ...filter,
      ...customFilter,
      ...search,
    }).populate(populate); // Use populate if defined

    // console.log("Fetched data with populated tagId:", data);

    let lists = [];
    if (Model === Task) {
      try {
        const taskGroups = data.reduce((acc, task) => {
          const tag = task.tagId;
          if (!tag || !tag._id || !tag.name) {
            console.warn(
              `Task with ID ${task._id} has an invalid tagId.`,
              task.tagId
            );
            return acc;
          }
          const tagId = tag._id.toString();
          if (!acc[tagId]) {
            acc[tagId] = {
              name: tag.name,
              count: 0,
              countOfComplete: 0,
              countOfUncomplete: 0,
            };
          }
          acc[tagId].count++;
          if (task.isCompleted) {
            acc[tagId].countOfComplete++;
          } else {
            acc[tagId].countOfUncomplete++;
          }
          return acc;
        }, {});

        // console.log("Task groups by tagId:", taskGroups);

        lists = Object.keys(taskGroups)
          .map((tagId) => ({
            tagId,
            name: taskGroups[tagId].name,
            count: taskGroups[tagId].count,
            countOfComplete: taskGroups[tagId].countOfComplete,
            countOfUncomplete: taskGroups[tagId].countOfUncomplete,
          }))
          .sort((a, b) => b.count - a.count);

        // console.log("Sorted lists:", lists);
      } catch (err) {
        console.error("Error processing lists:", err);
      }
    }

    let details = {
      filter,
      customFilter,
      search,
      sort,
      skip,
      limit,
      lists,
      page,
      pages: {
        previous: page > 0 ? page : false,
        activePage: page + 1,
        next: page + 2,
        totalPage: Math.ceil(data.length / limit),
      },
      total: data.length,
    };
    details.pages.next =
      details.pages.next > details.pages.totalPage ? false : details.pages.next;
    if (details.total <= limit) details.pages = false;

    return details;
  };

  next();
};
