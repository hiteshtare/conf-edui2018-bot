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
function saveRef(ref, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        const changes = [];
        changes[`references/${ref.activityId}`] = ref;
        yield storage.write(changes);
        return Promise.resolve(ref.activityId);
    });
}
exports.saveRef = saveRef;
function getRef(userId, storage) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = `references/${userId}`;
        var result = yield storage.read([key]);
        return Promise.resolve(result);
    });
}
function subscribe(userId, storage, adapter) {
    return __awaiter(this, void 0, void 0, function* () {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            const ref = yield getRef(userId, storage);
            if (ref) {
                yield adapter.continueConversation(ref, (context) => __awaiter(this, void 0, void 0, function* () {
                    yield context.sendActivity("Proactive message is sent");
                }));
            }
        }), 3000);
    });
}
exports.subscribe = subscribe;
//# sourceMappingURL=proactive.js.map