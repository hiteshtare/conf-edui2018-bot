"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
const moment = require("moment");
function saveRef(ref, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = {};
        changes[`reference/${ref.activityId}`] = ref;
        yield storage.write(changes);
        return yield ref.activityId;
    });
}
exports.saveRef = saveRef;
function getRef(userId, storage, saveSessions) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `reference/${userId}`;
        var r = yield storage.read([key]);
        if (r[key]['speakerSession'] !== undefined && saveSessions !== null && saveSessions.length === 0) {
            saveSessions = JSON.parse(r[key]['speakerSession']);
        }
        return yield r[key];
    });
}
exports.getRef = getRef;
function subscribe(userId, storage, adapter, saveSessions) {
    return __awaiter(this, void 0, void 0, function* () {
        if (moment(moment.now()).isBetween(moment('2018-10-06').toDate(), moment('2018-10-12').toDate())) {
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                const ref = yield getRef(userId, storage);
                if (ref) {
                    yield adapter.continueConversation(ref, (context) => __awaiter(this, void 0, void 0, function* () {
                        saveSessions.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                            if (element !== undefined) {
                                const s = parser_1.getExact(element);
                                const d = moment(`${s.date} ${s.startTime}`);
                                const d15 = moment(`${s.date} ${s.startTime}`).subtract(15, "minutes");
                                if (moment(moment.now()).isBetween(d15.toDate(), d.toDate())) {
                                    yield context.sendActivity(`Reminder: The session ${s.title} from ${s.speakers}
                 is about to start at ${s.startTime} in ${s.location}`);
                                    element == undefined;
                                }
                            }
                        }));
                        saveSessions = saveSessions.filter(v => v);
                    }));
                }
            }), 300000);
        }
    });
}
exports.subscribe = subscribe;
//# sourceMappingURL=proactive.js.map