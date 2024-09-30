import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { useCart } from '../providers/CartProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TokenExpiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TokenExpiredDialog: React.FC<TokenExpiredDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout, createGuestUser } = useAuth();
  const { clearCart, updateCart } = useCart();

  const handleContinueAsGuest = async () => {
    try {
      await logout(() => {});
      clearCart();
      const newGuestUser = await createGuestUser();
      if (newGuestUser) {
        await updateCart();
        onClose();
      } else {
        throw new Error("Failed to create guest user");
      }
    } catch (error) {
      console.error("Error continuing as guest:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  const handleNavigateToLogin = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired. Please choose an option to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleContinueAsGuest}>
            Continue as Guest
          </Button>
          <Button onClick={handleNavigateToLogin}>
            Log In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

