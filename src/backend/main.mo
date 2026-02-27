import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

actor {
  module Transaction {
    public type Category = {
      #payroll;
      #saas;
      #infrastructure;
      #marketing;
      #legal;
      #office;
      #other;
    };

    public type Type = {
      id : Nat;
      date : Int;
      description : Text;
      amount : Float;
      category : Category;
      source : Text;
    };

    public func compare(t1 : Type, t2 : Type) : Order.Order {
      Int.compare(t2.date, t1.date);
    };
  };

  module AnomalyAlert {
    public type Type = {
      category : Text;
      currentSpend : Float;
      averageSpend : Float;
      description : Text;
    };
  };

  module BurnRateSummary {
    public type Type = {
      monthlyBurnRate : Float;
      runwayMonths : Float;
      runwayText : Text;
      totalSpent : Float;
      avgMonthlySpend : Float;
    };
  };

  module WeeklySummary {
    public type Type = {
      totalSpend : Float;
      topCategory : Text;
      anomalyDetected : Bool;
      anomalyDetails : Text;
    };
  };

  type Settings = {
    startingBalance : Float;
    fundingAmount : Float;
    fakeDataMode : Bool;
    connectedAccount : Text;
  };

  let transactions = Map.empty<Nat, Transaction.Type>();
  var transactionIdCounter = 0;
  var settings : Settings = {
    startingBalance = 500_000;
    fundingAmount = 500_000;
    fakeDataMode = false;
    connectedAccount = "";
  };

  public query ({ caller }) func getTransactions() : async [Transaction.Type] {
    transactions.values().toArray().sort();
  };

  public shared ({ caller }) func addTransaction(date : Int, description : Text, amount : Float, category : Transaction.Category, source : Text) : async Nat {
    let transaction : Transaction.Type = {
      id = transactionIdCounter;
      date;
      description;
      amount;
      category;
      source;
    };
    transactions.add(transactionIdCounter, transaction);
    let currentId = transactionIdCounter;
    transactionIdCounter += 1;
    currentId;
  };

  public shared ({ caller }) func deleteTransaction(id : Nat) : async () {
    if (not transactions.containsKey(id)) {
      Runtime.trap("Transaction " # id.toText() # " does not exist. ");
    };
    transactions.remove(id);
  };

  public query ({ caller }) func getSettings() : async Settings {
    settings;
  };

  public shared ({ caller }) func saveSettings(newSettings : Settings) : async () {
    settings := newSettings;
  };

  // Placeholder for future statistical logic
  public query ({ caller }) func getBurnRateSummary() : async BurnRateSummary.Type {
    { monthlyBurnRate = 0; runwayMonths = 0; runwayText = ""; totalSpent = 0; avgMonthlySpend = 0 };
  };

  // Placeholder for future statistical logic
  public query ({ caller }) func getWeeklySummary() : async WeeklySummary.Type {
    { totalSpend = 0; topCategory = ""; anomalyDetected = false; anomalyDetails = "" };
  };

  // Placeholder for future statistical logic
  public query ({ caller }) func detectAnomalies() : async [AnomalyAlert.Type] {
    [];
  };

  // Maintains as simple transaction store
  public shared ({ caller }) func clearData() : async () {
    transactions.clear();
  };

  // Placeholder for future statistical logic
  public query ({ caller }) func getTotalExpensesByCategory() : async [(Text, Float)] {
    [];
  };
};
