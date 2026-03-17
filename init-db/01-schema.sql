CREATE TABLE Teacher (
    TeacherID INT PRIMARY KEY, -- Primary key for the Teacher entity
    Name VARCHAR(255) -- Attribute for Teacher's name
);

CREATE TABLE "Group" ( -- Using quotes for "Group" as it can be a reserved keyword
    GroupID INT PRIMARY KEY, -- Primary key for the Group entity
    GroupName VARCHAR(255), -- Attribute for Group's name
    TeacherID INT, -- Foreign key from the "Manages" relationship (Many-to-One: A Group is managed by one Teacher)
    FOREIGN KEY (TeacherID) REFERENCES Teacher(TeacherID) -- Establishes the foreign key constraint
);

CREATE TABLE Child (
    ChildID INT PRIMARY KEY, -- Primary key for the Child entity
    Age INT, -- Attribute for Child's age
    GroupID INT, -- Foreign key from the "BelongsTo" relationship (Many-to-One: A Child belongs to one Group)
    FOREIGN KEY (GroupID) REFERENCES "Group"(GroupID) -- Establishes the foreign key constraint
);