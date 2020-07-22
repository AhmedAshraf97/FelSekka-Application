'''
Created on Wed Jul  1 22:29:50 2020

@author: narim
'''
import sys
import numpy as np
import skimage.io as io
from skimage.color import rgb2gray
from commonfunctions import *
from skimage.filters import threshold_otsu,gaussian
import argparse
import cv2
from skimage.morphology import dilation,square,erosion,skeletonize, thin,binary_erosion, binary_dilation
from skimage import feature
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from PIL import Image
from skimage.measure import find_contours
from skimage.filters import median
from skimage.morphology import disk
from skimage.draw import rectangle
from skimage import data, filters
from skimage.filters import threshold_local
import math  
from skimage import util 
import tensorflow as tf
from tensorflow import keras
import io
from PIL import Image
import time
import binascii
import struct


def binarizeImage(Image):
    Image[Image<127]=1
    Image[Image>=127]=0
    return Image

  
def BinarizingImage(Image):
    Image[Image<127]=0
    Image[Image>=127]=1
    return Image
  
def featuresextraction(Image):
    featurevector=[]
    error= False
    
    #resize   
    if( (Image.shape[0]<28) or (Image.shape[1]<28)) :
        resizedimg = cv2.resize(Image.astype(np.uint8), (28,28), interpolation = cv2.INTER_LINEAR)
    else:
        resizedimg = cv2.resize(Image.astype(np.uint8), (28,28), interpolation = cv2.INTER_AREA)
    resized=BinarizingImage(resizedimg)
    #Height/Width 
    vertical_img = np.sum(resized,axis=1)
    result1 = np.where(vertical_img >= 1)
    if(len(result1[0])>0):
        height=result1[0][-1]-result1[0][0]
        horizontal_img = np.sum(resized,axis=0)
        result2 = np.where(horizontal_img >= 1)  
        width=result2[0][-1]-result2[0][0]
        ratio=height/width
        featurevector.append(ratio)
    
        #NumberOfBlackPixels/NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(resized)
        NumberOfBlackPixels = 784 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/NumberOfWhitePixels
        featurevector.append(ratioB2W)
        #NumberOfHorizontalTransitions
        for j in range(28):
            transitionsVertical=0
            flag=0
            i=0
            while(i<28):
                if(resized[j][i]==1 and flag==0): #white
                    transitionsVertical+=1
                    flag=1
                elif(resized[j][i]==0 and flag==1): #black
                    transitionsVertical+=1
                    flag=0
                i+=1
            featurevector.append(transitionsVertical)
        #NumberOfVerticalTransitions
        for j in range(28):
            transitionsVertical=0
            flag=0
            i=0
            while(i<28):
                if(resized[i][j]==1 and flag==0): #white
                    transitionsVertical+=1
                    flag=1
                elif(resized[i][j]==0 and flag==1): #black
                    transitionsVertical+=1
                    flag=0
                i+=1
            featurevector.append(transitionsVertical)
        #Baseline location vertical
        xline= thin(resized)
        horizontal_img = np.sum(xline,axis=1)
        blur=gaussian(horizontal_img)
        PeakValue= np.argmax(blur)
        featurevector.append(PeakValue+1)
        #Baseline location horizontal
        xline= thin(resized)
        horizontal_img = np.sum(xline,axis=0)
        blur=gaussian(horizontal_img)
        PeakValue= np.argmax(blur)
        featurevector.append(PeakValue+1)
      
        #detect holes
        transitionsVertical=0
        flag=0
        i=0
        while(i<28):
            if (resized[i,13]==1 and flag==0): #white
                transitionsVertical+=1
                flag=1
            elif(resized[i,13]==0 and flag==1): #black
                transitionsVertical+=1
                flag=0
            i+=1      
            if(transitionsVertical>= 3):
                featurevector.append(1)
                x=1
            else:
                featurevector.append(0)
                x=0
        
        #4 regions
        Region1= resized[0:13,0:13]
        Region2= resized[0:13,14:27]
        Region3= resized[14:27,0:13]
        Region4= resized[14:27,14:27]
        #Black Pixels in Region 1/ White Pixels in Region 1
        NumberOfWhitePixels = cv2.countNonZero(Region1)
        NumberOfBlackPixels = 196 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
        featurevector.append(ratioB2W)
        #Black Pixels in Region 2/ White Pixels in Region 2
        NumberOfWhitePixels = cv2.countNonZero(Region2)
        NumberOfBlackPixels = 196 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
        featurevector.append(ratioB2W)
        #Black Pixels in Region 3/ White Pixels in Region 3
        NumberOfWhitePixels = cv2.countNonZero(Region3)
        NumberOfBlackPixels = 196 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
        featurevector.append(ratioB2W)
        #Black Pixels in Region 4/ White Pixels in Region 4
        NumberOfWhitePixels = cv2.countNonZero(Region4)
        NumberOfBlackPixels = 196 - NumberOfWhitePixels
        ratioB2W=NumberOfBlackPixels/max(NumberOfWhitePixels,1)
        featurevector.append(ratioB2W)
        #Black Pixels in Region 1/ Black Pixels in Region 2
        NumberOfWhitePixels = cv2.countNonZero(Region1)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region2)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 3/ Black Pixels in Region 4
        NumberOfWhitePixels = cv2.countNonZero(Region3)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region4)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 1/ Black Pixels in Region 3
        NumberOfWhitePixels = cv2.countNonZero(Region1)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region3)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 2/ Black Pixels in Region 4
        NumberOfWhitePixels = cv2.countNonZero(Region2)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region4)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 1/ Black Pixels in Region 4
        NumberOfWhitePixels = cv2.countNonZero(Region1)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region4)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
        #Black Pixels in Region 2/ Black Pixels in Region 3
        NumberOfWhitePixels = cv2.countNonZero(Region2)
        NumberOfBlackPixels1 = 196 - NumberOfWhitePixels
        NumberOfWhitePixels = cv2.countNonZero(Region3)
        NumberOfBlackPixels2 = 196 - NumberOfWhitePixels
        ratioB2B=NumberOfBlackPixels1/max(NumberOfBlackPixels2,1)
        featurevector.append(ratioB2B)
       
        #HorizontalProjection
        horizontal_img = np.sum(resized,axis=1) #sum on x-axis (rows) 
        featurevector=np.concatenate((featurevector,horizontal_img))
        #VerticalProjection
        vertical_img = np.sum(resized,axis=0) #sum on x-axis (rows) 
        featurevector=np.concatenate((featurevector,vertical_img))
        #28 x 28
        A=np.array(resized).flatten()
        featurevector=np.concatenate((featurevector,A))
    else:
        error = True
        
    return featurevector,error

def erosion(img, size=(3,3)):    
    edgex = math.floor(size[0]/2)
    edgey = math.floor(size[1]/2)
    new_img = np.zeros([img.shape[0], img.shape[1]]) 
    for x in range(edgex, img.shape[0]-edgex):
        for y in range(edgey, img.shape[1]-edgey):
            colorArray = []
            for fx in range(size[0]):
                for fy in range(size[1]):
                    colorArray.append(img[x+fx-edgex][y+fy-edgey])
            new_img[x][y] = np.min(colorArray)
    return new_img

def dilation(img, size=(3,3)):    
    edgex = math.floor(size[0]/2)
    edgey = math.floor(size[1]/2)
    new_img = np.zeros([img.shape[0], img.shape[1]])
    for x in range(edgex, img.shape[0]-edgex):
        for y in range(edgey, img.shape[1]-edgey):
            colorArray = []
            for fx in range(size[0]):
                for fy in range(size[1]):
                    colorArray.append(img[x+fx-edgex][y+fy-edgey])
            new_img[x][y] = np.max(colorArray)
    return new_img

def Medianfilter(imagegray,rowsfilter,colsfilter):
    rows= imagegray.shape[0]
    cols= imagegray.shape[1]
    imagemedian=np.zeros((rows,cols))
    edgex= int(rowsfilter/2)
    edgey= int(colsfilter/2)
    for i in range(edgex,(rows-edgex)):
        for j in range(edgey,(cols-edgey)):
            colorarray=np.zeros((rowsfilter,colsfilter))
            for k in range(rowsfilter):
                for l in range(colsfilter):
                    colorarray[k][l]=imagegray[i+k-edgex][j+l-edgey]
            colorarray.sort()
            imagemedian[i][j]=np.median(colorarray)
    return imagemedian

def detectBlank(char):
    rows = char.shape[0]
    cols = char.shape[1]
    area = rows*cols
    NumberOfWhitePixels = cv2.countNonZero(char.astype(np.uint8))
    NumberOfBlackPixels = area - NumberOfWhitePixels
    if(NumberOfWhitePixels/NumberOfBlackPixels> 0.01):
        return False
    else:
        return True
    
def remove_black_background(img):
    image = img.copy()
    rows = img.shape[0]
    cols = img.shape[1]
    gray = cv2.cvtColor(img.astype(np.uint8), cv2.COLOR_BGR2GRAY)
    gray = 255*(gray < 128).astype(np.uint8)
    zerorows=np.all(gray == 0, axis=1)
    zerocols=np.all(gray == 0, axis=0)
    arr=[]
    arr2=[]
    for i in range(rows-1):
        if(zerorows[i]==True):
            arr.append(i)       
    for i in range(cols-1):
        if(zerocols[i]==True):
           arr2.append(i)
    lengthofzerorows = len(arr)
    lengthofzerocols = len(arr2)
    if(lengthofzerorows/rows> 0.1 or lengthofzerocols/cols>0.2):
        changed = True
    else:
        changed = False
    image = np.delete(image, arr, axis=0) 
    image = np.delete(image, arr2, axis=1)
    
    return image

def detectCard(image,lowthresh,highthresh,erode):
    image= ((rgb2gray(image))*255).astype(np.uint8) 
    image=canny(image.astype(np.uint8),low_threshold= lowthresh,high_threshold= highthresh)
    rows = image.shape[0]
    cols = image.shape[1]
    area = rows*cols
    kernel1size = int(rows/100)
    kernel2size = int(cols/100)
    kernel = np.ones((kernel1size,kernel2size), np.uint8)
    image = binary_dilation(image.astype(np.uint8), kernel)
    if(erode):
        image=binary_erosion(image.astype(np.uint8),kernel)      
    boxes=[]
    bounding_boxes=[]
    contours = find_contours(image,0.8)
    for contour in contours:
        box = []
        minX = int(np.min(contour[:,1]))
        minY = int(np.min(contour[:,0]))
        maxX = int(np.max(contour[:,1]))
        maxY = int(np.max(contour[:,0]))
        box.append(minX)
        box.append(maxX)
        box.append(minY)
        box.append(maxY)
        boxes.append(box)
    maximum=0
    max_index =1
    counter=0
    for box in boxes:
         width = abs(box[1]-box[0])
         length = abs(box[3]-box[2])
         contourarea = width*length
         if(length>0):
             if((width/length) > 1.5 and (width/length)<2 ): 
                 if(contourarea/area > 0.2):
                     if(maximum<contourarea):
                         maximum=contourarea
                         max_index=counter
                         bounding_boxes.append(box)
                         counter = counter+1
    return bounding_boxes,max_index
   
def extractPlateNumbersandLetters(imagegray,lowthresh,highthresh,dilate,dilateagain):
    rows= imagegray.shape[0]
    cols= imagegray.shape[1]
    imagegray = imagegray[0:int(rows/2),0:int(4*cols/5)]
    rows= imagegray.shape[0]
    cols= imagegray.shape[1]
    area = rows*cols
    imagegray= ((rgb2gray(imagegray))*255).astype(np.uint8) 
    imagegray=canny(imagegray.astype(np.uint8),low_threshold= lowthresh,high_threshold= highthresh)
    kernelsize=cols/100 
    if(cols>500):
        kernelsize=kernelsize+2
    if(cols>700):
        kernelsize=kernelsize+3
    if(cols>1000):
        kernelsize=kernelsize+5
    if(cols>1500):
        kernelsize=kernelsize+10
    if(dilate):
        kernelsize = kernelsize +2 
    if(dilateagain):
        kernelsize = kernelsize+5 
    horizontalkernel = np.ones((1,int(kernelsize)), np.uint8)
    card = binary_dilation(imagegray.astype(np.uint8), horizontalkernel) 
    boxes=[]
    bounding_boxes=[]
    contours = find_contours(card,0.8)
    for contour in contours:
        box = []
        minX = int(np.min(contour[:,1]))
        minY = int(np.min(contour[:,0]))
        maxX = int(np.max(contour[:,1]))
        maxY = int(np.max(contour[:,0]))
        box.append(minX)
        box.append(maxX)
        box.append(minY)
        box.append(maxY)
        boxes.append(box)
    for box in boxes:
        width = abs(box[1]-box[0])
        length = abs(box[3]-box[2])
        contourarea = width*length
        if( (box[1]-box[0]!=0) and (box[3]-box[2]!=0) ):
              if(contourarea/area>0.1 and contourarea/area<0.3):
                if(length/width > 0.1 and length/width <0.2): 
                    if(width>(0.5*cols) and length>(0.2*rows) ): 
                      if(width<(0.8*cols) and length<(0.5*rows)):
                          bounding_boxes.append(box)

    return bounding_boxes
    
def callDetectCard(image):
    copy = image.copy() 
    bounding_boxes,max_index= detectCard(image,70,140,False)
    if(len(bounding_boxes)>0):
             card = copy[(bounding_boxes[max_index][2]):(bounding_boxes[max_index][3]) , (bounding_boxes[ max_index][0]):(bounding_boxes[max_index][1])]
    else:
            boundingbox,index = detectCard(image,70,140,True)     
            if(len(boundingbox)>0):
                card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
            else:
                     boundingbox,index = detectCard(image,50,100,False)
                     if(len(boundingbox)>0):
                         card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                     else:
                              boundingbox,index = detectCard(image,50,100,True)
                              if(len(boundingbox)>0):
                                  card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                              else:
                                  boundingbox,index = detectCard(image,25,50,False)
                                  if(len(boundingbox)>0):
                                      card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                                  else:
                                      boundingbox,index = detectCard(image,25,50,True)     
                                      if(len(boundingbox)>0):
                                            card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                                      else:
                                            boundingbox,index = detectCard(image,10,20,False)
                                            if(len(boundingbox)>0):
                                                 card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                                            else:
                                                  boundingbox,index = detectCard(image,10,20,True)
                                                  if(len(boundingbox)>0):
                                                      card = copy[(boundingbox[index][2]):(boundingbox[index][3]) , (boundingbox[ index][0]):(boundingbox[index][1])]
                                                  else:
                                                      card= remove_black_background(image) 
    
    return card

def callextractPlateNumbersandLetters(card):
    numbersandlettersfound= False
    img_with_boxes =((rgb2gray(card))*255).astype(np.uint8)
    bounding_boxes = extractPlateNumbersandLetters(card,120,240,False,False)
    if(len(bounding_boxes)==1): 
            numbersandlettersfound= True
            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
    else:
        bounding_boxes= extractPlateNumbersandLetters(card,110,220,False,False)
        if(len(bounding_boxes)==1): 
            numbersandlettersfound= True
            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
        else:
             bounding_boxes= extractPlateNumbersandLetters(card,100,200,False,False)
             if(len(bounding_boxes)==1):
                 numbersandlettersfound= True
                 numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
             else:
                     bounding_boxes= extractPlateNumbersandLetters(card,70,140,False,False)
                     if(len(bounding_boxes)==1):
                        numbersandlettersfound= True
                        numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                     else:
                        bounding_boxes= extractPlateNumbersandLetters(card,60,120,False,False)
                        if(len(bounding_boxes)==1):
                            numbersandlettersfound= True
                            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                        else:
                            bounding_boxes= extractPlateNumbersandLetters(card,50,100,False,False)
                            if(len(bounding_boxes)==1):
                                numbersandlettersfound= True
                                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                            else:
                                bounding_boxes= extractPlateNumbersandLetters(card,40,80,False,False)
                                if(len(bounding_boxes)==1):
                                        numbersandlettersfound= True
                                        numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                else:
                                        bounding_boxes= extractPlateNumbersandLetters(card,10,140,False,False)
                                        if(len(bounding_boxes)==1):
                                            numbersandlettersfound= True
                                            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                        else:
                                            numbersandlettersfound= False                                     
    if(numbersandlettersfound == False):
        bounding_boxes = extractPlateNumbersandLetters(card,120,240,True,False)
        if(len(bounding_boxes)==1): 
                numbersandlettersfound= True
                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
        else:
            bounding_boxes= extractPlateNumbersandLetters(card,110,220,True,False)
            if(len(bounding_boxes)==1): 
                numbersandlettersfound= True
                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
            else:
                 bounding_boxes= extractPlateNumbersandLetters(card,100,200,True,False)
                 if(len(bounding_boxes)==1):
                     numbersandlettersfound= True
                     numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                 else:
                        bounding_boxes= extractPlateNumbersandLetters(card,70,140,True,False)
                        if(len(bounding_boxes)==1):
                             numbersandlettersfound= True
                             numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                        else:
                             bounding_boxes= extractPlateNumbersandLetters(card,60,120,True,False)
                             if(len(bounding_boxes)==1):
                                numbersandlettersfound= True
                                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                             else:
                                bounding_boxes= extractPlateNumbersandLetters(card,50,100,True,False)
                                if(len(bounding_boxes)==1):
                                    numbersandlettersfound= True
                                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                else:
                                    bounding_boxes= extractPlateNumbersandLetters(card,40,80,True,False)
                                    if(len(bounding_boxes)==1):
                                            numbersandlettersfound= True
                                            numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                    else:
                                            bounding_boxes= extractPlateNumbersandLetters(card,10,140,True,False)
                                            if(len(bounding_boxes)==1):
                                                numbersandlettersfound= True
                                                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
        if(numbersandlettersfound == False):
            bounding_boxes = extractPlateNumbersandLetters(card,120,240,True,True)
            if(len(bounding_boxes)==1): 
                    numbersandlettersfound= True
                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
            else:
                bounding_boxes= extractPlateNumbersandLetters(card,110,220,True,True)
                if(len(bounding_boxes)==1): 
                    numbersandlettersfound= True
                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                else:
                     bounding_boxes= extractPlateNumbersandLetters(card,100,200,True,True)
                     if(len(bounding_boxes)==1):
                         numbersandlettersfound= True
                         numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                     else:
                            bounding_boxes= extractPlateNumbersandLetters(card,70,140,True,True)
                            if(len(bounding_boxes)==1):
                                 numbersandlettersfound= True
                                 numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                            else:
                                 bounding_boxes= extractPlateNumbersandLetters(card,60,120,True,True)
                                 if(len(bounding_boxes)==1):
                                    numbersandlettersfound= True
                                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                 else:
                                    bounding_boxes= extractPlateNumbersandLetters(card,50,100,True,True)
                                    if(len(bounding_boxes)==1):
                                        numbersandlettersfound= True
                                        numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                    else:
                                        bounding_boxes= extractPlateNumbersandLetters(card,40,80,True,True)
                                        if(len(bounding_boxes)==1):
                                                numbersandlettersfound= True
                                                numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                        else:
                                                bounding_boxes= extractPlateNumbersandLetters(card,10,140,True,True)
                                                if(len(bounding_boxes)==1):
                                                    numbersandlettersfound= True
                                                    numbersandletters= img_with_boxes[bounding_boxes[0][2]:bounding_boxes[0][3] , bounding_boxes[0][0]:bounding_boxes[0][1] ]
                                                else:
                                                    numbersandlettersfound= False  
                                                    numbersandletters = np.zeros((15,15))
    return numbersandlettersfound,numbersandletters


def extractCharacters(image):
    image =cv2.threshold(image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]    
    rows = image.shape[0]
    cols = image.shape[1]
    characters=[]
    final_characters = []
    horizontal_kernel = np.ones((1,int(cols/10)), np.uint8)
    vertical_kernel =np.ones((int(rows/2),1), np.uint8)    
    horizontal_lines = binary_erosion(image.astype(np.uint8), horizontal_kernel) 
    horizontal_lines = binary_dilation(horizontal_lines.astype(np.uint8), horizontal_kernel) 
    vertical_lines = binary_erosion(image.astype(np.uint8), vertical_kernel) 
    vertical_lines = binary_dilation(vertical_lines.astype(np.uint8), vertical_kernel) 
    cnts = cv2.findContours(horizontal_lines.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    for c in cnts:
        cv2.drawContours(image, [c], -1, (0,0,0), 2)
    cnts = cv2.findContours(vertical_lines.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    for c in cnts:
        cv2.drawContours(image, [c], -1, (0,0,0), 2)
    col = int(cols/7)
    for i in range(7):
        character = image[: ,(i*col):((i+1)*col)]
        characters.append(character)
    for char in  characters: 
        image = char
        copy = np.copy(image)
        charrows = char.shape[0]
        charcols = char.shape[1]
        image = median(image,disk(1))
        kernel1size = int(charrows/25)
        kernel = np.ones((kernel1size,kernel1size),np.uint8)
        image=binary_erosion(image,kernel)
        copy = np.copy(image)
        kernelsize1=int(charrows/10)
        kernelsize2=int(charcols/10)
        kernel = np.ones((kernelsize1,kernelsize2),np.uint8)
        image=binary_dilation(image,kernel)
        contours = find_contours(image,0.8)
        boxes= []
        bounding_boxes = [] 
        for contour in contours:
            box = []
            minX = (int(np.min(contour[:,1])))
            minY = (int(np.min(contour[:,0])))
            maxX = (int(np.max(contour[:,1])))
            maxY = (int(np.max(contour[:,0])))
            if(minY- (int(charrows/10)) >0):
                if(minY>charrows/4 and minY<charrows/2):
                    minY = minY- (int(charrows/10))
            if(maxY + (int(charrows/10))<charrows):
                if(maxY<3*charrows/4 and maxY>charrows/2):
                    maxY = maxY + (int(charrows/10))
            box.append(minX)
            box.append(maxX)
            box.append(minY)
            box.append(maxY)
            boxes.append(box)
        maximum=0
        max_index =1
        counter=0
        for box in boxes:      
            width = abs(box[1]-box[0])
            length = abs(box[3]-box[2])
            contourarea = width*length
            if(width<int(4*charcols/5) ):
                if(length>int(charrows/3) and length<int(4*charrows/5)):
                     if(maximum<contourarea):
                         maximum=contourarea
                         max_index=counter
                         bounding_boxes.append(box)
                         counter = counter+1
        if(len(bounding_boxes)==1):
            if( ((bounding_boxes[0][3] + 3) <charrows) and  ((bounding_boxes[0][0] - 3) >0) and  ((bounding_boxes[0][1] + 3) <charcols)): 
                finalcharacter = copy[(bounding_boxes[0][2]):(bounding_boxes[0][3] + 3) , (bounding_boxes[0][0]-3):(bounding_boxes[0][1]+3) ]
            else:
                 finalcharacter = copy[(bounding_boxes[0][2]):(bounding_boxes[0][3]) , (bounding_boxes[0][0]):(bounding_boxes[0][1]) ]
            final_characters.append(finalcharacter)
        elif(len(bounding_boxes)>1):
            finalcharacter = copy[(bounding_boxes[max_index][2]):(bounding_boxes[max_index][3] + 3) , (bounding_boxes[max_index][0]-3):(bounding_boxes[max_index][1]+3) ]
            final_characters.append(finalcharacter)
        elif(len(bounding_boxes)==0):
            final_characters.append(copy)
    return final_characters

    
    
modeldigits = keras.Sequential([
        keras.layers.InputLayer(input_shape = (938,)),
        keras.layers.Dense(600,activation= tf.nn.relu),
        keras.layers.Dense(300,activation= tf.nn.relu),
        keras.layers.Dense(9,activation= tf.nn.softmax)
        ])
modeldigits.load_weights('my_model_weights_digits.h5')

modelletters = keras.Sequential([
        keras.layers.InputLayer(input_shape = (938,)),
        keras.layers.Dense(600,activation= tf.nn.relu),
        keras.layers.Dense(300,activation= tf.nn.relu),
        keras.layers.Dense(17,activation= tf.nn.softmax)
        ])
modelletters.load_weights('my_model_weights_letters.h5')

def predictiondigits(Image):
        Features_Vector = []
        Features,error = featuresextraction(Image)
        if(error==False):
            Features_Vector.append(Features)
            Features_Vector=np.asarray(Features_Vector)
            predictions = modeldigits.predict(Features_Vector)
            pred = np.argmax(predictions[0])
        else:
            pred = -1
        return pred 
    
def predictionletters(Image):
        Features_Vector = []
        Features,error = featuresextraction(Image)
        if(error==False):
            Features_Vector.append(Features)
            Features_Vector=np.asarray(Features_Vector)
            predictions = modelletters.predict(Features_Vector)
            pred = np.argmax(predictions[0])
        else:
            pred = -1
        return pred 
    
data = sys.argv[3]
#bytearray(data[:4])
#bytearray(b'\xff\xd8\xff\xe0')
#imagename = str( time.strftime("%Y%m%d-%H%M%S")) +".jpeg"
#f = open(imagename, 'wb')
#f.write(bytearray(data))
#f.close()
image = cv2.imread(data)
plateletters = sys.argv[1]
platenumbers = sys.argv[2]
numberOfLetters = len(plateletters)
numberOfNumbers = len(platenumbers)
card = callDetectCard(image)  
predictedNumbers = [] 
predictedLetters = []  
numberOfBlank=0     
wrongPicture=False                                       
numbersandlettersfound,numbersandletters = callextractPlateNumbersandLetters(card)
if(numbersandlettersfound):
    show_images([numbersandletters])
    final_characters=extractCharacters(numbersandletters) 
    for i in range (numberOfNumbers):
        final_characters[i] = final_characters[i].astype(np.uint8)  
        final_characters[i]=final_characters[i]*255
        pred = predictiondigits(final_characters[i])
        if(pred == -1):
            numberOfBlank = numberOfBlank=1
        elif(pred==0):
            predictedNumbers.append("١")
        elif(pred==1):
            predictedNumbers.append("٢")
        elif(pred==2):
            predictedNumbers.append("٣")   
        elif(pred==3):
            predictedNumbers.append("٤")
        elif(pred==4):
            predictedNumbers.append("٥")  
        elif(pred==5):
            predictedNumbers.append("٦")  
        elif(pred==6):
            predictedNumbers.append("٧")   
        elif(pred==7):
            predictedNumbers.append("٨") 
        elif(pred==8):
            predictedNumbers.append("٩")
        else:
            numberOfBlank = numberOfBlank=1
            predictedLetters.append("nothing found")
            print("nothing found")      
        print(pred+1)
    for i in range (numberOfLetters,0,-1):
        final_characters[7-i] = final_characters[7-i].astype(np.uint8)  
        final_characters[7-i]=final_characters[7-i]*255
        pred = predictionletters(final_characters[7-i])
        if(pred == -1):
            numberOfBlank = numberOfBlank=1
        elif(pred==0):
            predictedLetters.append("أ")
            print("أ")
        elif(pred==1):
            predictedLetters.append("ب")
            print("ب")
        elif(pred==2):
            predictedLetters.append("ج")
            print("ج")
        elif(pred==3):
            predictedLetters.append("د")
            print("د")
        elif(pred==4):
            predictedLetters.append("ر")
            print("ر")
        elif(pred==5):
            predictedLetters.append("س")
            print("س")
        elif(pred==6):
            predictedLetters.append("ص")
            print("ص")
        elif(pred==7):
            predictedLetters.append("ط")
            print("ط")
        elif(pred==8):
            predictedLetters.append("ع")
            print("ع")
        elif(pred==9):
            predictedLetters.append("ف")
            print("ف")
        elif(pred==10):
            predictedLetters.append("ق")
            print("ق")
        elif(pred==11):
            predictedLetters.append("ل")
            print("ل")
        elif(pred==12):
            predictedLetters.append("م")
            print("م")
        elif(pred==13):
            predictedLetters.append("ن")
            print("ن")
        elif(pred==14):
            predictedLetters.append("و")
            print("و")
        elif(pred==15):
            predictedLetters.append("ه")
            print("ه")
        elif(pred==16):
            predictedLetters.append("ي")
            print("ي")
        else:
            numberOfBlank = numberOfBlank=1
            predictedLetters.append("nothing found")
            print("nothing found")    
    if(numberOfBlank<=1):
        correctdigits=0
        correctletters=0
        digitsVerified = False
        lettersVerified = False
        for i in range(numberOfNumbers):
            if(len(platenumbers)==len(predictedNumbers)):
                if(platenumbers[i]==predictedNumbers[i]):
                    correctdigits=correctdigits+1
                else:
                    if(platenumbers[i]=="٦" and predictedNumbers[i] == "١"):
                        correctdigits=correctdigits+1
                    elif(platenumbers[i]=="٩" and predictedNumbers[i] == "١"):
                        correctdigits=correctdigits+1
                    elif(platenumbers[i]=="٢" and predictedNumbers[i] == "٣"):
                        correctdigits=correctdigits+1
                    elif(platenumbers[i]=="٣" and predictedNumbers[i] == "٢"):
                        correctdigits=correctdigits+1    
            else:
                wrongPicture = True
        for i in range(numberOfLetters):
            if(len(plateletters)==len(predictedLetters)):
                if(plateletters[i]==predictedLetters[(numberOfLetters-1)-i]):
                    correctletters=correctletters+1 
                else:
                    if(plateletters[i]=="ق" and predictedLetters=="ف" ):
                        correctletters=correctletters+1 
                    elif(plateletters[i]=="ف" and predictedLetters=="ق" ):
                        correctletters=correctletters+1 
                    elif(plateletters[i]=="ص" and predictedLetters=="س" ):
                        correctletters=correctletters+1 
                    elif(plateletters[i]=="س" and predictedLetters=="ص" ):
                        correctletters=correctletters+1
                    elif(plateletters[i]=="ع" and predictedLetters=="ج" ):
                        correctletters=correctletters+1 
                    elif(plateletters[i]=="ج" and predictedLetters=="ع" ):
                        correctletters=correctletters+1
            else:
                wrongPicture = True
        if(correctdigits>= math.ceil(numberOfNumbers/2)):
            digitsVerified = True
            
        if(correctletters>= math.ceil(numberOfLetters/2)):
            lettersVerified = True
            
    else:
        wrongPicture = True
else:
        wrongPicture = True
    
if(wrongPicture):
    print("Please enter another picture")
elif(digitsVerified and lettersVerified):
    print("Letters and digits entered are correct")
elif(digitsVerified and ~lettersVerified):
    print("Letters entered are incorrect")
elif(lettersVerified and ~digitsVerified):
    print("Digits entered are incorrect") 

 print("Please enter another picture")       