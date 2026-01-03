"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  useGetAdvertisementCostQuery,
  useUpdateAdvertisementCostMutation,
} from "../../features/advertisement/advertisementApi";
import { TbCurrencyDollarCanadian } from "react-icons/tb";
import toast from 'react-hot-toast';

interface AdvertisementApiResponse {
  success: boolean;
  message: string;
  data: number;
}

interface ApiError {
  data?: {
    message?: string;
  };
}

function Advertisement() {
  const [replaceDialogOpen, setReplaceDialogOpen] = useState<boolean>(false);
  const [cost, setCost] = useState<string>("");

  // API Hooks
  const { data, isLoading, isError, error } = useGetAdvertisementCostQuery({});
  const [updateAdvertisementCost, { isLoading: isUpdating }] =
    useUpdateAdvertisementCostMutation();

  // Extract cost from API response
  const apiData = data as AdvertisementApiResponse | undefined;
  const currentCost = useMemo(() => {
    return apiData?.data || 0;
  }, [apiData?.data]);

  // Set initial cost when data loads
  useEffect(() => {
    if (currentCost > 0 && !replaceDialogOpen) {
      setCost(currentCost.toString());
    }
  }, [currentCost, replaceDialogOpen]);

  const openReplaceDialog = () => {
    setCost(currentCost > 0 ? currentCost.toString() : "");
    setReplaceDialogOpen(true);
  };

  const handleReplace = async () => {
    const costValue = parseFloat(cost);

    if (!cost || isNaN(costValue) || costValue < 0) {
      toast.error("Please enter a valid cost amount");
      return;
    }

    try {
      await updateAdvertisementCost({ cost: costValue }).unwrap();
      toast.success("Advertisement cost updated successfully");
      setReplaceDialogOpen(false);
    } catch (error: unknown) {
      console.error("Update error:", error);
      const apiError = error as ApiError;
      toast.error(
        apiError?.data?.message || "Failed to update advertisement cost"
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading advertisement cost...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 font-semibold">
              Error loading advertisement cost
            </p>
            <p className="mt-2 text-gray-600">
              {error && "data" in error
                ? JSON.stringify(error.data)
                : "An error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Advertisement Cost Management
        </h1>

        <div className="bg-white rounded-lg shadow">
          {/* Header with Replace Button */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Cost</p>
              <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TbCurrencyDollarCanadian />{" "}
                {currentCost > 0 ? currentCost.toFixed(2) : "0.00"}
              </p>
            </div>
            <Button
              onClick={openReplaceDialog}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Replace Cost
            </Button>
          </div>
        </div>
      </div>

      {/* Replace Cost Dialog */}
      <Dialog open={replaceDialogOpen} onOpenChange={setReplaceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Replace Advertisement Cost</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cost">Advertisement Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Enter cost amount"
                className="mt-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter the cost in C$ (e.g., 100.00)
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setReplaceDialogOpen(false);
                setCost(currentCost > 0 ? currentCost.toString() : "");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReplace}
              disabled={isUpdating || !cost}
              className="bg-red-700 hover:bg-red-800 text-white"
            >
              {isUpdating ? "Updating..." : "Replace Cost"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Advertisement;
