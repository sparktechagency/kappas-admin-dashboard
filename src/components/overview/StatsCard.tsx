import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

type Props = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
};

const StatsCard = ({ title, value, change, changeType, icon: Icon, iconBg }: Props) => {

  const userName = 'John Doe';

  console.log(userName);

  

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold mb-2">{value}</h3>
            <div className="flex items-center gap-1">
              {changeType === 'increase' ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                {changeType === 'increase' ? 'Increased' : 'Decreased'} By {change}
              </span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;