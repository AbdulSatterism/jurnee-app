import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { NotificationRoutes } from '../app/modules/notifications/notifications.route';
import { termsRoutes } from '../app/modules/terms/terms.route';
import { privacyRoutes } from '../app/modules/privacy/privacy.routes';
import { aboutRoutes } from '../app/modules/aboutUs/aboutUs.route';
import { tersmConditionRoutes } from '../app/modules/termsAndCondition/termsAndCondition.route';
import { FollowerRoutes } from '../app/modules/follower/follower.route';
import { PostRoute } from '../app/modules/post/post.route';
import { LikeRoutes } from '../app/modules/like/like.route';
import { SavedRoutes } from '../app/modules/saved/saved.route';
import { ReportRoutes } from '../app/modules/report/report.route';
import { ReviewRoutes } from '../app/modules/review/review.route';
import { ChatRoutes } from '../app/modules/chat/chat.route';
import { supportRoutes } from '../app/modules/support/support.route';
import { PaymentRoutes } from '../app/modules/payment/payment.route';
import { BookingRoutes } from '../app/modules/booking/booking.route';
import { InterestRoutes } from '../app/modules/interest/interest.route';
import { CommentRoutes } from '../app/modules/comment/comment.route';
import { replyRoutes } from '../app/modules/commentReply/commentReply.route';
import { OfferRoute } from '../app/modules/offer/offer.route';

const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/follower', route: FollowerRoutes },
  { path: '/notification', route: NotificationRoutes },
  { path: '/terms', route: termsRoutes },
  { path: '/privacy', route: privacyRoutes },
  { path: '/about', route: aboutRoutes },
  { path: '/guidelines', route: tersmConditionRoutes },
  { path: '/post', route: PostRoute },
  { path: '/like', route: LikeRoutes },
  { path: '/save', route: SavedRoutes },
  { path: '/report', route: ReportRoutes },
  { path: '/review', route: ReviewRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/replies', route: replyRoutes },
  { path: '/chat', route: ChatRoutes },
  { path: '/support', route: supportRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/bookings', route: BookingRoutes },
  { path: '/interest', route: InterestRoutes },
  { path: '/offer', route: OfferRoute },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
