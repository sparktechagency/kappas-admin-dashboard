"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useGetMaintainanceQuery, useUpdateMaintainanceMutation } from "@/features/maintanance/maintananceApi";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import CustomLoading from '../../../../components/Loading/CustomLoading';

const Page = () => {
  const { data, isLoading: isMaintanceLoading } = useGetMaintainanceQuery({});
  const [MaintanceDate, { isLoading }] = useUpdateMaintainanceMutation();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isEnabled, setIsEnabled] = useState(false);

  // Set default values from API response
  useEffect(() => {
    if (data?.data?.isUnderMaintenance !== undefined) {
      setIsEnabled(data.data.isUnderMaintenance.status);

      // Set the date if endAt exists
      if (data.data.isUnderMaintenance.endAt) {
        setSelectedDate(new Date(data.data.isUnderMaintenance.endAt));
      }
    }
  }, [data]);

  const handleToggle = async (checked: boolean) => {
    try {
      if (checked) {
        // Turning ON - need date
        if (!selectedDate) {
          toast.error("Please select an end date first!");
          return;
        }
        await MaintanceDate({
          isUnderMaintenance: true,
          endAt: format(selectedDate, "yyyy-MM-dd"),
        }).unwrap();
        setIsEnabled(true);
        toast.success(`Maintenance Mode Enabled. System will be under maintenance until ${format(selectedDate, "PPP")}`);
      } else {
        // Turning OFF - no date needed
        await MaintanceDate({
          isUnderMaintenance: false,
        }).unwrap();
        setIsEnabled(false);
        toast.success("Maintenance Mode Disabled. System is now accessible to users");
      }
    } catch (error) {
      console.error("Failed to update maintenance mode:", error);
      toast.error("Failed to update maintenance mode");
    }
  };

  if (isMaintanceLoading) {
    return (
      <CustomLoading />
    )
  }

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl rounded shadow-2xl bg-red-50 pt-4">
        <CardHeader className="space-y-4 border-red-500">
          <div className="flex items-center justify-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-red-600">
            Maintenance Mode Control
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Schedule system maintenance and control access
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Calendar Section */}
          <div className="space-y-3">
            <Label htmlFor="date" className="text-base font-semibold text-red-700">
              Select Maintenance End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-12 border-2 hover:border-red-300 hover:bg-red-50",
                    !selectedDate && "text-muted-foreground",
                    selectedDate && "border-red-200 bg-red-50"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-red-600" />
                  {selectedDate ? (
                    <span className="text-red-700 font-medium">
                      {format(selectedDate, "PPP")}
                    </span>
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="border-red-200"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-red-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Enable/Disable</span>
            </div>
          </div>

          {/* Switch Section */}
          <div className="flex items-center justify-between p-6 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="space-y-1">
              <Label htmlFor="maintenance-mode" className="text-base font-semibold text-red-700">
                Maintenance Mode
              </Label>
              <p className="text-sm text-gray-600">
                {isEnabled ? "System is under maintenance" : "System is operational"}
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={isEnabled}
              onCheckedChange={handleToggle}
              disabled={isLoading}
              className="data-[state=checked]:bg-red-600"
            />
          </div>

          {/* Status Display */}
          {isEnabled && selectedDate && (
            <div className="p-4 bg-red-100 border-l-4 border-red-600 rounded">
              <p className="text-sm font-medium text-red-800">
                🔴 Active: Maintenance scheduled until {format(selectedDate, "PPP")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;