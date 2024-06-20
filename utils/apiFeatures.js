const AppError = require("./appError");

class APIFeatures {
  /**
   *
   * @param {*} query the query Object we use to call a `Model.find({ query })`
   * @param {*} queryString the string extracted from `req.query`
   * @param {*} resource the string extracted from `Model.modelName` to know which resource to search in DB (e.g. `Activity`, `Task`, `User`)
   */
  constructor(query, queryString, resource) {
    this.query = query;
    this.queryString = queryString;
    this.resource = resource;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let allowedFields = [];

    switch (this.resource) {
      case `Activity`:
        allowedFields = ["taskName", "isActive", "user", "startTime", "endTime"];
        break;
      case `Task`:
        allowedFields = ["taskName", "isActive", "state", "progressState"];
        break;
      case `User`:
        allowedFields = ["firstName", "lastName", "role", "isAccepted", "isActive", "creationDate"];
        break;
      default:
        throw new AppError("Develop Error: `resource` not passed correctly, please enter a `Model.modelName`", 400);
    }

    for (const queryEl in queryObj) {
      if (!allowedFields.includes(queryEl)) {
        throw new AppError(`${queryEl} is not a valid keyword in this URL queryString`, 400);
      }
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-creationDate");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
