#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SecurityCheckModule, NSObject)

RCT_EXTERN_METHOD(checkDeviceSecurity:(NSDictionary *)options
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

@end
