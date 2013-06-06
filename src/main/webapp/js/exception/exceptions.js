/**
 * Created with JetBrains WebStorm.
 * User: amalyuhin
 * Date: 05.06.13
 * Time: 1:44
 * To change this template use File | Settings | File Templates.
 */

function InvalidDataError(message) {
    this.name = 'InvalidData';
    this.message = message || 'Invalid data.';
}