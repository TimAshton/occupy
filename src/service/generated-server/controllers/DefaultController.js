/**
 * The DefaultController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/DefaultService');
const v1GameGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1GameGET);
};

const v1GamePOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1GamePOST);
};

const v1GameSystemGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1GameSystemGET);
};

const v1GameSystemPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1GameSystemPATCH);
};

const v1PlayerGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1PlayerGET);
};

const v1PlayerPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1PlayerPATCH);
};

const v1PlayerPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1PlayerPOST);
};

const v1SeasonGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1SeasonGET);
};

const v1SeasonPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1SeasonPATCH);
};

const v1SeasonPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1SeasonPOST);
};

const v1SectorGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1SectorGET);
};

const v1SectorPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1SectorPATCH);
};

const v1SectorPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.v1SectorPOST);
};


module.exports = {
  v1GameGET,
  v1GamePOST,
  v1GameSystemGET,
  v1GameSystemPATCH,
  v1PlayerGET,
  v1PlayerPATCH,
  v1PlayerPOST,
  v1SeasonGET,
  v1SeasonPATCH,
  v1SeasonPOST,
  v1SectorGET,
  v1SectorPATCH,
  v1SectorPOST,
};
