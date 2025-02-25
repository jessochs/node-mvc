const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  });
};

/* ***************************
 *  Build inventory by single vehicle view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inv_id;
  const data = await invModel.getVehicleByInventoryId(inv_id);
  
  // Log the vehicle data to the console for debugging
  console.log('Vehicle data:', data);

  const detail = await utilities.buildVehicleDetail(data[0]);
  const reviewdata = await invModel.getReviewsByInventoryId(inv_id)
  const review = await utilities.buildReviews(reviewdata)
  let nav = await utilities.getNav();
  const make = data[0].inv_make;
  const model = data[0].inv_model;
  const year = data[0].inv_year;
  const classname = year + " " + make + " " + model;
  res.render("./inventory/vehicle-details", {
    title: classname,
    nav,
    detail,
    inv_id,
    reviewdata,
    review,
    errors: null,
  });
};

/* ***************************
 *  Deliver Management View
 * ************************** */

invCont.viewManagement = async function (req, res, next) {
  let nav = await utilities.getNav(); 
  const classificationList = await utilities.buildClassificationList()
  res.render('./inventory/management', {
    title: "Inventory Management",
    nav,
    classificationList,
    errors: null,
  })
}


/* ***************************
 *  Deliver new classification view
 * ************************** */
invCont.addNewClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render('./inventory/add-classification', {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

/* ***************************
 *  Process new classification 
 * ************************** */
invCont.registerNewClassification = async function (req, res) {
  
  const { classification_name } = req.body;

  const classResult = await invModel.registerNewClassification(classification_name)

  let nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList()

  if (classResult) {
    req.flash(
      "notice",
      `Classification ${classification_name} was successfully added.`
    )
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the new account failed.")
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
    })
  }
}

/* ***************************
 *  Deliver new inventory view
 * ************************** */
invCont.addNewInventory = async function (req, res, next) {
  let nav = await utilities.getNav()

  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Process new vehicle
 * ************************** */

invCont.addVehicle = async function (req, res) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, } = req.body;

  const invResult = await invModel.addVehicle(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    
  )

  if (invResult) {
    req.flash(
      "notice",
      `Vehicle ${inv_make} ${inv_model} was added.`
    )
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the new vehicle registration failed.")
    res.status(501).render("./inventory/add-inventory", {

      title: "Add New Vehicle",
      nav,
      classificationList,
      errors:null
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Edit Vehicle
 * ************************** */
invCont.editVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id)
  const itemData = await invModel.getVehicleByInventoryId(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateVehicle(
    inv_id,  
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Delete Vehicle
 * ************************** */
invCont.deleteVehicle = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.params.inv_id)
  const itemData = await invModel.getVehicleByInventoryId(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_price: itemData[0].inv_price,
  })
}

/* ***************************
 *  Delete Vehicle Data
 * ************************** */
invCont.deleteVehicleData = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {inv_id } = req.body
  const parsedInvId = parseInt(inv_id)

  const deleteResult = await invModel.deleteVehicle(parsedInvId)

  if (deleteResult) {
    
    req.flash("notice", `The vehicle was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Delete Vehicle",
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    
    })
  }
}

/* ***************************
 *  add review
 * ************************** */
invCont.addReview = async function (req, res, next) {
  let nav = await utilities.getNav()
  let { review_text, inv_id, account_id } = req.body;
  let result = await invModel.addReview(review_text, inv_id, account_id)

  const singlepagedata = await invModel.getVehicleByInventoryId(inv_id)
  const singlepageview = await utilities.buildVehicleDetail(singlepagedata)
  const reviewdata = await invModel.getReviewsByInventoryId(inv_id)
  const review = await utilities.buildReviews(reviewdata, res)

  if (result) {
    req.flash("notice", "Review added.");
    res.redirect("/inv/detail/" + inv_id);
  } else {
    req.flash("notice", "Sorry, the review failed.");
    res.status(501).render("./inventory/vehicle-details", {
      title: singlepagedata.inv_make + " " + singlepagedata.inv_model,
      nav,
      inv_id,
      singlepageview,
      reviewdata,
      review,
      errors: null,
    });
  }
};








module.exports = invCont;
