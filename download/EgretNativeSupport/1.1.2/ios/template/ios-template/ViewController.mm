#import "ViewController.h"

@implementation ViewController

- (instancetype)initWithEAGLView:(UIView*)eaglView {
    if (self = [super init]) {
        self.view = eaglView;
    }
    return self;
}

- (BOOL)prefersStatusBarHidden {
    return YES;
}

- (BOOL)shouldAutorotate {
    return YES;
}

- (UIInterfaceOrientationMask)supportedInterfaceOrientations {
    return UIInterfaceOrientationMaskPortrait|UIInterfaceOrientationMaskLandscape;
}

@end
