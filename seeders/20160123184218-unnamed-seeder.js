'use strict';

var faker = require('faker');

module.exports = {
  up: function (queryInterface, Sequelize) {
    for (var i = 0; i < 10; i++) {
      return queryInterface.bulkInsert('Gallery', [
      {
        author: faker.name.firstName(),
        link: faker.image.imageURL(),
        description: faker.lorem.sentences(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
    }
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
